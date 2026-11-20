import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { DashboardStats } from '../../types';
import { adminService } from '../../services/admin.service';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboard();
        if (res.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-48 h-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500">Live operational metrics and store analytics</p>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> From verified orders
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Lifetime customer purchases</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customers</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalCustomers}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Registered buyer accounts</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog Inventory</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.totalProducts}</h3>
            <p className="text-[11px] text-slate-500 mt-1">Active products in store</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          to="/admin/orders?status=PENDING"
          className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl flex items-center justify-between hover:bg-amber-100/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-sm">
                {stats.pendingOrders} Pending Order{stats.pendingOrders === 1 ? '' : 's'}
              </h4>
              <p className="text-xs text-amber-700">Orders awaiting processing or payment</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-800" />
        </Link>

        <Link
          to="/admin/products"
          className="bg-rose-50/70 border border-rose-200 p-5 rounded-2xl flex items-center justify-between hover:bg-rose-100/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-950 text-sm">
                {stats.lowStockCount} Low Stock Item{stats.lowStockCount === 1 ? '' : 's'}
              </h4>
              <p className="text-xs text-rose-700">Products with stock under 10 units</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-rose-800" />
        </Link>
      </div>

      {/* Recent Orders & Low Stock Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View All Orders &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="py-3.5 text-slate-600">{ord.user?.name || ord.shippingName}</td>
                    <td className="py-3.5">
                      <Badge
                        variant={
                          ord.status === 'CONFIRMED' || ord.status === 'DELIVERED'
                            ? 'success'
                            : ord.status === 'CANCELLED'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 font-extrabold text-slate-900">
                      ₹{ord.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100">
            Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {stats.lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-slate-900 text-xs truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    {p.stock} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
