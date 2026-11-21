import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag, Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/';
  const errorMsg = searchParams.get('error');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const success = await login(data);
    setIsLoading(false);
    if (success) {
      navigate(redirect);
    }
  };

  const handleDemoFill = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setValue('email', 'admin@ecommerce.com', { shouldValidate: true, shouldDirty: true });
      setValue('password', 'Admin@123456', { shouldValidate: true, shouldDirty: true });
    } else {
      setValue('email', 'ashwin@example.com', { shouldValidate: true, shouldDirty: true });
      setValue('password', 'User@123456', { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-mono-code">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#ded8cb] shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block font-syne text-3xl font-extrabold text-[#120a06] mb-1 lowercase">
            shopvista<span className="text-xs text-[#2563eb] align-super">®</span>
          </Link>
          <h2 className="text-xl font-extrabold text-[#120a06] font-syne uppercase tracking-tight">
            Sign In to ShopVista®
          </h2>
          <p className="text-xs text-[#7a6857]">
            Access live price intelligence, track orders, and monitor deals
          </p>
        </div>

        {errorMsg === 'admin_required' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 text-center">
            Administrator privileges required. Please sign in with an Admin account.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full shadow-md shadow-blue-600/20"
          >
            Sign In
          </Button>
        </form>

        {/* Demo Fast-Fill Buttons */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
            One-Click Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin')}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer"
            >
              Fill Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('user')}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
            >
              Fill Customer Demo
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
