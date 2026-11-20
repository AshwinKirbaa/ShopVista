import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit } = useForm<{ name: string; phone: string }>({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: { name: string; phone: string }) => {
    setIsSaving(true);
    try {
      const res = await authService.updateProfile(data);
      if (res.success && res.data.user) {
        updateUser(res.data.user);
        toast.success('Profile details saved successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{user?.name}</h1>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
              {user?.role} Account
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            icon={<User className="w-4 h-4" />}
            {...register('name', { required: true })}
          />

          <Input
            label="Email Address (Read Only)"
            value={user?.email || ''}
            disabled
            icon={<Mail className="w-4 h-4" />}
            className="bg-slate-50 text-slate-500 cursor-not-allowed"
          />

          <Input
            label="Phone Number"
            icon={<Phone className="w-4 h-4" />}
            placeholder="+91 9876543210"
            {...register('phone')}
          />

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              icon={<Check className="w-4 h-4" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
