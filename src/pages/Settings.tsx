import React, { useEffect, useState } from 'react';
import CustomerLayout from '../components/layout/CustomerLayout';
import { userService } from '../services/userService';
import { useAuthStore } from '../stores/authStore';
import { ScreenProps, UpdateProfileRequest } from '../types';

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
  ) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export default function Settings({ onNavigate }: ScreenProps) {
  const authUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [fullName, setFullName] = useState(authUser?.fullName ?? '');
  const [email, setEmail] = useState(authUser?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError('');

      const data = await userService.getProfile();

      if (!isActive) {
        return;
      }

      if (!data) {
        setError('Không thể tải hồ sơ lúc này. Bạn vẫn có thể chỉnh sửa thông tin đang hiển thị.');
        setIsLoading(false);
        return;
      }

      setFullName(data.fullName ?? '');
      setEmail(data.email ?? authUser?.email ?? '');
      setPhoneNumber(data.phoneNumber ?? '');
      
      updateUser({
        fullName: data.fullName ?? authUser?.fullName ?? '',
      });
      setIsLoading(false);
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [authUser?.email, authUser?.fullName, updateUser]);

  const handleFieldChange = (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError('');
    if (success) setSuccess('');
    setter(event.target.value);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) return;

    const trimmedFullName = fullName.trim();

    if (!trimmedFullName) {
      setSuccess('');
      setError('Họ và tên không được để trống.');
      return;
    }

    const payload: UpdateProfileRequest = {
      fullName: trimmedFullName,
      phoneNumber: phoneNumber.trim() || null,
      avatarUrl: null,
    };

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await userService.updateProfile(payload);
      setFullName(trimmedFullName);
      setPhoneNumber(payload.phoneNumber ?? '');
      setSuccess(response.message || 'Cập nhật thông tin thành công.');
      updateUser({
        fullName: trimmedFullName,
      });
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Không thể lưu thông tin. Vui lòng thử lại sau.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="settings">
      <div className="px-6 pb-20 md:px-8">
        <div className="mx-auto max-w-2xl space-y-8 mt-8">
          <header className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-extrabold font-headline tracking-tight">Cài đặt tài khoản</h1>
            <p className="text-sm text-secondary">
              Quản lý thông tin cá nhân và cài đặt bảo mật của bạn.
            </p>
          </header>

          <section className="rounded-3xl border border-outline-variant/30 bg-surface-container-low p-6 shadow-sm md:p-8">
            <div className="mb-8 border-b border-outline-variant/30 pb-4">
              <h2 className="text-xl font-bold font-headline">Hồ sơ cá nhân</h2>
              <p className="mt-1 text-sm text-secondary">Cập nhật họ tên và số điện thoại liên lạc.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSave}>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="settings-full-name">
                  Họ và tên <span className="text-error">*</span>
                </label>
                <input
                  id="settings-full-name"
                  type="text"
                  value={fullName}
                  onChange={handleFieldChange(setFullName)}
                  disabled={isSaving || isLoading}
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-3.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="settings-phone">
                  Số điện thoại
                </label>
                <input
                  id="settings-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handleFieldChange(setPhoneNumber)}
                  disabled={isSaving || isLoading}
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-3.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="settings-email">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <input
                    id="settings-email"
                    type="email"
                    value={email}
                    readOnly
                    className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high p-3.5 text-sm text-secondary focus:outline-none opacity-80 cursor-not-allowed"
                    placeholder="Đang tải email..."
                  />
                  <div className="absolute top-1/2 right-4 -translate-y-1/2">
                    <span className="rounded-full bg-outline-variant/20 px-2 py-1 text-[10px] font-bold uppercase text-secondary">Chỉ đọc</span>
                  </div>
                </div>
                <p className="text-xs text-secondary mt-1 ml-1">Email được dùng để đăng nhập và không thể thay đổi.</p>
              </div>

              <div className="pt-6 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-outline-variant/30 gap-4">
                <div className="text-sm text-secondary">
                  {isLoading ? 'Đang tải thông tin...' : ' '}
                </div>
                <button
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-on-primary transition-colors hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 sm:w-auto disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </CustomerLayout>
  );
}

