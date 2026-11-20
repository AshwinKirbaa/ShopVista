import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Ban,
  ArrowLeft,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/order.service';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isSuccess = searchParams.get('success') === 'true';

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await orderService.getOrder(id);
      if (res.success) {
        setOrder(res.data);
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const res = await orderService.cancelOrder(order.id, 'Customer requested cancellation');
      if (res.success) {
        toast.success('Order cancelled successfully. Stock has been restored.');
        setCancelModalOpen(false);
        fetchOrder();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="w-1/3 h-8" />
        <Skeleton className="w-full h-40 rounded-3xl" />
        <Skeleton className="w-full h-64 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-6">We couldn't locate the requested order.</p>
        <Link to="/orders">
          <Button variant="primary">View My Orders</Button>
        </Link>
      </div>
    );
  }

  const timelineSteps: { status: OrderStatus; label: string }[] = [
    { status: 'PENDING', label: 'Order Placed' },
    { status: 'CONFIRMED', label: 'Payment Confirmed' },
    { status: 'PROCESSING', label: 'Packed & Processing' },
    { status: 'SHIPPED', label: 'Shipped' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { status: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIdx = timelineSteps.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Notification Banner */}
      {isSuccess && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-4 animate-in fade-in">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-emerald-950">Thank you for your order!</h3>
            <p className="text-sm text-emerald-700">
              Your payment has been verified. We have sent a confirmation email to {order.user?.email || 'your email'}.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {order.orderNumber}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Can only cancel if PENDING or CONFIRMED */}
        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
          <Button
            variant="outline"
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
            onClick={() => setCancelModalOpen(true)}
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Progress Timeline Stepper */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">
          Order Status Tracker
        </h3>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 font-semibold text-sm">
            <Ban className="w-5 h-5 shrink-0" />
            <span>This order was cancelled. Stock has been returned to inventory.</span>
          </div>
        ) : (
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-2">
            {timelineSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.status} className="flex sm:flex-col items-center gap-3 text-center flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-blue-600 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items & Shipping Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Purchased Items List */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Purchased Items ({order.items.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{item.productName}</h4>
                  <p className="text-xs text-slate-500">
                    ₹{item.price.toLocaleString('en-IN')} &times; {item.quantity}
                  </p>
                </div>
                <span className="font-extrabold text-sm text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total</span>
              <span className="text-blue-600">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="lg:col-span-5 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Delivery Address</span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{order.shippingName}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
              </p>
              <p className="text-slate-500 pt-1">Phone: {order.shippingPhone}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Payment Details</span>
            </div>
            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-bold text-slate-900">
                  {order.payment?.method || 'RAZORPAY'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status</span>
                <Badge
                  variant={order.payment?.status === 'PAID' ? 'success' : 'warning'}
                  size="sm"
                >
                  {order.payment?.status || 'PENDING'}
                </Badge>
              </div>
              {order.payment?.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono text-slate-700">{order.payment.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action will immediately release reserved stock."
        confirmLabel="Yes, Cancel Order"
        isDestructive={true}
        isLoading={isCancelling}
      />
    </div>
  );
};
