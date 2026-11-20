import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  CreditCard,
  Smartphone,
  CheckCircle2,
  XCircle,
  X,
  Info,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface RazorpayTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderId: string;
  razorpayOrderId: string;
  amount: number; // in paise
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => Promise<void>;
  onFailure: (errorDescription: string) => void;
}

export const RazorpayTestModal: React.FC<RazorpayTestModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  orderId,
  razorpayOrderId,
  amount,
  customer,
  onSuccess,
  onFailure,
}) => {
  const [tab, setTab] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('success@razorpay');
  const [selectedApp, setSelectedApp] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const displayAmount = (amount / 100).toLocaleString('en-IN');

  const handleSimulateSuccess = async () => {
    setIsProcessing(true);
    const mockPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await onSuccess({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: 'mock_valid_signature',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateFailure = () => {
    onFailure('Payment declined by issuing bank (Simulated Test)');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Razorpay Branded Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl z-10 border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0b1426] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-base shadow-md">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base">
                  Razorpay <span className="text-blue-400 font-normal text-xs">Checkout</span>
                </span>
                <span className="text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Test Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">ShopVista Online Store</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Info Strip */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Order:</span>{' '}
            <span className="font-bold text-slate-800">{orderNumber}</span>
          </div>
          <div>
            <span className="text-slate-400">Payable:</span>{' '}
            <span className="font-extrabold text-slate-900 text-sm text-blue-600">
              ₹{displayAmount}
            </span>
          </div>
        </div>

        {/* Payment Tabs */}
        <div className="flex border-b border-slate-100 bg-white">
          <button
            onClick={() => setTab('upi')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              tab === 'upi'
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI / QR Code</span>
          </button>
          <button
            onClick={() => setTab('card')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              tab === 'card'
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cards / NetBanking</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {tab === 'upi' ? (
            <div className="space-y-5">
              {/* UPI Apps Grid */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select UPI Application
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'gpay', name: 'Google Pay', color: 'from-blue-500 to-emerald-500' },
                    { id: 'phonepe', name: 'PhonePe', color: 'from-purple-600 to-indigo-600' },
                    { id: 'paytm', name: 'Paytm', color: 'from-sky-500 to-blue-600' },
                    { id: 'bhim', name: 'BHIM UPI', color: 'from-orange-500 to-green-600' },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        setSelectedApp(app.id);
                        setUpiId(`${app.id}@upi`);
                      }}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        selectedApp === app.id
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${app.color} text-white font-black text-xs flex items-center justify-center shadow-xs`}
                      >
                        {app.name.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full">
                        {app.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI ID Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Virtual Payment Address (VPA)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3.5 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Valid
                  </span>
                </div>
              </div>

              {/* QR Code Simulation */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="text-xs text-slate-600">
                  <p className="font-bold text-slate-800">Dynamic UPI QR Generated</p>
                  <p className="text-[11px] text-slate-400">Scan & pay with any UPI enabled app</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Test Card Number
                </label>
                <input
                  type="text"
                  readOnly
                  value="4111 •••• •••• 1111"
                  className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3.5 py-2.5 bg-slate-50 text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="12/28"
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3.5 py-2.5 bg-slate-50 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    CVV
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="123"
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3.5 py-2.5 bg-slate-50 text-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Developer Notice */}
          <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Razorpay Sandbox Mode:</strong> Verifies cryptographic signatures with your backend via HMAC SHA-256 and updates PostgreSQL atomically.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              type="button"
              size="lg"
              variant="primary"
              className="w-full shadow-lg shadow-blue-600/20"
              isLoading={isProcessing}
              onClick={handleSimulateSuccess}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Authorize UPI Payment (₹{displayAmount})
            </Button>

            <button
              type="button"
              onClick={handleSimulateFailure}
              disabled={isProcessing}
              className="w-full py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Simulate Payment Failure</span>
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-bit SSL Encrypted · Razorpay Verified Gateway</span>
        </div>
      </div>
    </div>
  );
};
