import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  CheckCircle,
  Save,
  Clock,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/order.service';
import { adminService } from '../../services/admin.service';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await orderService.getOrder(id);
      if (res.success) {
        setOrder(res.data);
        setSelectedStatus(res.data.status);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsUpdating(true);
    try {
      const res = await adminService.updateOrderStatus(order.id, selectedStatus, statusNote);
      if (res.success) {
        toast.success(`Order updated to ${selectedStatus}`);
        setStatusNote('');
        fetchOrder();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-full h-96 rounded-3xl" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Manage Order: {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <Badge variant={order.status === 'DELIVERED' ? 'success' : 'primary'} size="md">
          {order.status}
        </Badge>
      </div>

      {/* Status Transition Control Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Update Order Workflow Status</h3>

        <form onSubmit={handleStatusUpdate} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-1/3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="w-full sm:flex-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Note / Update Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Dispatched via BlueDart AWB#123456"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5"
            />
          </div>

          <Button type="submit" variant="primary" isLoading={isUpdating} icon={<Save className="w-4 h-4" />}>
            Apply Status
          </Button>
        </form>
      </div>

      {/* Customer & Items Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Order Items */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100">
            Order Items ({order.items.length})
          </h3>
          <div className="divide-y divide-slate-100">
            {order.items.map((i) => (
              <div key={i.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={i.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                    alt={i.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-xs truncate">{i.productName}</p>
                  <p className="text-[11px] text-slate-400">
                    ₹{i.price.toLocaleString('en-IN')} &times; {i.quantity}
                  </p>
                </div>
                <span className="font-extrabold text-xs text-slate-900">
                  ₹{(i.price * i.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-extrabold text-slate-900">
            <span>Total Value</span>
            <span className="text-blue-600">₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Customer & Shipping */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Delivery Destination
            </h3>
            <p className="font-bold text-xs text-slate-900">{order.shippingName}</p>
            <p className="text-xs text-slate-500">{order.shippingAddress}</p>
            <p className="text-xs text-slate-500">
              {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
            </p>
            <p className="text-xs font-semibold text-slate-700 pt-1">Phone: {order.shippingPhone}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Payment Verification
            </h3>
            <div className="text-xs space-y-1 text-slate-600">
              <p>
                Method: <span className="font-bold text-slate-900">{order.payment?.method}</span>
              </p>
              <p>
                Status:{' '}
                <span className="font-bold text-emerald-600">{order.payment?.status}</span>
              </p>
              {order.payment?.razorpayPaymentId && (
                <p className="font-mono text-[11px] truncate">
                  Razorpay ID: {order.payment.razorpayPaymentId}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
