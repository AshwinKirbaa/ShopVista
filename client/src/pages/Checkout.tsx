import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { paymentService } from '../services/payment.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { RazorpayTestModal } from '../components/payment/RazorpayTestModal';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  shippingName: z.string().min(2, 'Full name is required'),
  shippingPhone: z.string().min(10, 'Valid 10-digit phone number is required'),
  shippingAddress: z.string().min(5, 'Street address is required'),
  shippingCity: z.string().min(2, 'City is required'),
  shippingState: z.string().min(2, 'State is required'),
  shippingPincode: z.string().min(4, 'Postal code is required'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['RAZORPAY', 'COD']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const Checkout: React.FC = () => {
  const { cart, subtotal, shippingCharge, total, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTestModal, setActiveTestModal] = useState<{
    isOpen: boolean;
    orderNumber: string;
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    customer: {
      name: string;
      email: string;
      contact: string;
    };
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingName: user?.name || '',
      shippingPhone: user?.phone || '',
      shippingAddress: '',
      shippingCity: '',
      shippingState: '',
      shippingPincode: '',
      notes: '',
      paymentMethod: 'RAZORPAY',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  const handlePaymentVerificationSuccess = async (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    if (!activeTestModal) return;

    try {
      const verifyRes = await paymentService.verifyPayment({
        orderId: activeTestModal.orderId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (verifyRes.success) {
        toast.success('UPI Payment verified successfully! Order confirmed.');
        setActiveTestModal(null);
        await refreshCart();
        navigate(`/orders/${activeTestModal.orderId}?success=true`);
      } else {
        toast.error(verifyRes.error || 'Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      toast.error(err.response?.data?.error || 'Verification error');
    }
  };

  const handlePaymentFailure = (errorDescription: string) => {
    toast.error(errorDescription || 'Payment declined');
    setActiveTestModal(null);
    setIsProcessing(false);
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const orderRes = await paymentService.createPaymentOrder(data);

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.error || 'Failed to initialize order');
      }

      const orderData = orderRes.data;

      // 2. If COD, order is placed immediately
      if (data.paymentMethod === 'COD') {
        toast.success('Order placed successfully with Cash on Delivery!');
        await refreshCart();
        navigate(`/orders/${orderData.orderId}?success=true`);
        return;
      }

      // Check if using placeholder/test key or real Razorpay merchant key
      const isPlaceholderKey =
        !orderData.keyId ||
        orderData.keyId === 'rzp_test_placeholder' ||
        orderData.razorpayOrderId?.startsWith('order_') ||
        orderData.razorpayOrderId?.startsWith('rzp_mock_');

      if (isPlaceholderKey) {
        // Open the Razorpay UPI & Cards Sandbox modal
        setActiveTestModal({
          isOpen: true,
          orderNumber: orderData.orderNumber,
          orderId: orderData.orderId,
          razorpayOrderId: orderData.razorpayOrderId || `order_${Date.now()}`,
          amount: orderData.amount || Math.round(total * 100),
          customer: {
            name: data.shippingName,
            email: user?.email || '',
            contact: data.shippingPhone,
          },
        });
        setIsProcessing(false);
        return;
      }

      // 3. If real key exists, trigger Razorpay Checkout SDK
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ShopVista',
        description: `Payment for ${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: data.shippingName,
          email: user?.email || '',
          contact: data.shippingPhone,
        },
        theme: {
          color: '#2563EB',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast('Payment window closed. Your order is pending in orders tab.', {
              icon: 'ℹ️',
            });
            navigate(`/orders/${orderData.orderId}`);
          },
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await paymentService.verifyPayment({
              orderId: orderData.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              toast.success('Payment verified! Order confirmed.');
              await refreshCart();
              navigate(`/orders/${orderData.orderId}?success=true`);
            } else {
              toast.error(verifyRes.error || 'Payment signature verification failed');
              navigate(`/orders/${orderData.orderId}`);
            }
          } catch (err: any) {
            console.error('Payment verification error:', err);
            toast.error(err.response?.data?.error || 'Verification error');
            navigate(`/orders/${orderData.orderId}`);
          }
        },
      };

      if (typeof (window as any).Razorpay === 'function') {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (failRes: any) {
          console.warn('Razorpay failed, opening sandbox simulator:', failRes);
          // Fall back to sandbox modal instead of leaving user stuck
          setActiveTestModal({
            isOpen: true,
            orderNumber: orderData.orderNumber,
            orderId: orderData.orderId,
            razorpayOrderId: orderData.razorpayOrderId || `order_${Date.now()}`,
            amount: orderData.amount || Math.round(total * 100),
            customer: {
              name: data.shippingName,
              email: user?.email || '',
              contact: data.shippingPhone,
            },
          });
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback to Sandbox Modal
        setActiveTestModal({
          isOpen: true,
          orderNumber: orderData.orderNumber,
          orderId: orderData.orderId,
          razorpayOrderId: orderData.razorpayOrderId || `order_${Date.now()}`,
          amount: orderData.amount || Math.round(total * 100),
          customer: {
            name: data.shippingName,
            email: user?.email || '',
            contact: data.shippingPhone,
          },
        });
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <span className="font-semibold text-blue-600">Cart</span>
        <span>&rarr;</span>
        <span className="font-bold text-slate-900">Checkout</span>
        <span>&rarr;</span>
        <span>Confirmation</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Shipping Form */}
          <div className="lg:col-span-8 space-y-8">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delivery Information</h3>
                  <p className="text-xs text-slate-400">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  error={errors.shippingName?.message}
                  {...register('shippingName')}
                />
                <Input
                  label="Phone Number"
                  placeholder="10-digit mobile number"
                  error={errors.shippingPhone?.message}
                  {...register('shippingPhone')}
                />
              </div>

              <Input
                label="Street Address / Flat / Floor"
                placeholder="House No., Building, Street Name"
                error={errors.shippingAddress?.message}
                {...register('shippingAddress')}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  placeholder="e.g. Bengaluru"
                  error={errors.shippingCity?.message}
                  {...register('shippingCity')}
                />
                <Input
                  label="State"
                  placeholder="e.g. Karnataka"
                  error={errors.shippingState?.message}
                  {...register('shippingState')}
                />
                <Input
                  label="Postal Code (PIN)"
                  placeholder="6 digits"
                  error={errors.shippingPincode?.message}
                  {...register('shippingPincode')}
                />
              </div>

              <Input
                label="Delivery Instructions (Optional)"
                placeholder="Near landmark, leave at door, etc."
                {...register('notes')}
              />
            </div>

            {/* Payment Method Selection Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Select Payment Method</h3>
                  <p className="text-xs text-slate-400">Secure transactions with end-to-end encryption</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Razorpay Option */}
                <div
                  onClick={() => setValue('paymentMethod', 'RAZORPAY')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    selectedPaymentMethod === 'RAZORPAY'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Razorpay UPI & Cards</span>
                    <input
                      type="radio"
                      checked={selectedPaymentMethod === 'RAZORPAY'}
                      onChange={() => setValue('paymentMethod', 'RAZORPAY')}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Google Pay, PhonePe, Paytm, BHIM, NetBanking, and Cards
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md w-fit">
                    <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Secured
                  </div>
                </div>

                {/* COD Option */}
                <div
                  onClick={() => setValue('paymentMethod', 'COD')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    selectedPaymentMethod === 'COD'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Cash on Delivery</span>
                    <input
                      type="radio"
                      checked={selectedPaymentMethod === 'COD'}
                      onChange={() => setValue('paymentMethod', 'COD')}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Pay securely in cash or UPI when your order is delivered to your doorstep.
                  </p>
                  <div className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                    Verified address only
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Order Summary Sticky Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              Your Order ({cart?.itemCount || 0} items)
            </h3>

            {/* Item Previews */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
              {cart?.items.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span className="font-bold text-slate-800">{item.quantity}x</span>
                    <span className="text-slate-600 truncate">{item.product.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{item.lineTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shippingCharge === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
                  ) : (
                    `₹${shippingCharge}`
                  )}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-xl text-blue-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isProcessing}
              className="w-full shadow-lg shadow-blue-600/20"
              icon={<Lock className="w-4 h-4" />}
            >
              {selectedPaymentMethod === 'RAZORPAY' ? `Pay with UPI / Cards (₹${total.toLocaleString('en-IN')})` : 'Place Order (COD)'}
            </Button>

            <p className="text-center text-[11px] text-slate-400">
              By placing your order, you agree to ShopVista's Terms and Conditions.
            </p>
          </div>
        </div>
      </form>

      {/* Razorpay UPI / Cards Test Modal */}
      {activeTestModal && (
        <RazorpayTestModal
          isOpen={activeTestModal.isOpen}
          onClose={() => setActiveTestModal(null)}
          orderNumber={activeTestModal.orderNumber}
          orderId={activeTestModal.orderId}
          razorpayOrderId={activeTestModal.razorpayOrderId}
          amount={activeTestModal.amount}
          customer={activeTestModal.customer}
          onSuccess={handlePaymentVerificationSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
  );
};
