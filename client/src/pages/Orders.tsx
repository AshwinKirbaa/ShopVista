import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { orderService } from '../services/order.service';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await orderService.getOrders(page, 8);
        if (res.success) {
          setOrders(res.data);
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages);
          }
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending Payment</Badge>;
      case 'CONFIRMED':
        return <Badge variant="primary">Confirmed</Badge>;
      case 'PROCESSING':
        return <Badge variant="indigo">Processing</Badge>;
      case 'SHIPPED':
        return <Badge variant="purple">Shipped</Badge>;
      case 'OUT_FOR_DELIVERY':
        return <Badge variant="warning">Out for Delivery</Badge>;
      case 'DELIVERED':
        return <Badge variant="success">Delivered</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="w-48 h-8 mb-6" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-32 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Package className="w-12 h-12 text-slate-400" />}
          title="No Orders Found"
          description="You haven't placed any orders yet. Discover our latest collections and start shopping!"
          actionLabel="Start Shopping"
          onAction={() => (window.location.href = '/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">
        Your Purchase History
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="group block bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="space-y-1">
                <span className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors text-base">
                  {order.orderNumber}
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(order.status)}
                <span className="text-lg font-extrabold text-slate-900">
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0"
                    title={item.productName}
                  >
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl">
                    +{order.items.length - 3} more
                  </span>
                )}
                <span className="text-xs text-slate-600 font-medium ml-2 hidden sm:inline">
                  {order.items.map((i) => i.productName).join(', ')}
                </span>
              </div>

              <span className="text-xs font-bold text-blue-600 group-hover:underline shrink-0 ml-4">
                View Details
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
    </div>
  );
};
