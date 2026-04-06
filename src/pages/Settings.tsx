import React, { useEffect, useState } from 'react';
import CustomerLayout from '../components/layout/CustomerLayout';
import { userService } from '../services/userService';
import { useAuthStore } from '../stores/authStore';
import { ScreenProps, UpdateProfileRequest } from '../types';

const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=400&q=80';

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
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatarUrl ?? '');
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
      setAvatarUrl(data.avatarUrl ?? '');
      updateUser({
        fullName: data.fullName ?? authUser?.fullName ?? '',
        avatarUrl: data.avatarUrl ?? undefined,
      });
      setIsLoading(false);
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [authUser?.email, authUser?.fullName, updateUser]);

  const handleFieldChange = (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (error) {
      setError('');
    }

    if (success) {
      setSuccess('');
    }

    setter(event.target.value);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const trimmedFullName = fullName.trim();

    if (!trimmedFullName) {
      setSuccess('');
      setError('Họ tên không được để trống.');
      return;
    }

    const payload: UpdateProfileRequest = {
      fullName: trimmedFullName,
      phoneNumber: phoneNumber.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
    };

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await userService.updateProfile(payload);
      setFullName(trimmedFullName);
      setPhoneNumber(payload.phoneNumber ?? '');
      setAvatarUrl(payload.avatarUrl ?? '');
      setSuccess(response.message || 'Đã lưu thay đổi thành công.');
      updateUser({
        fullName: trimmedFullName,
        avatarUrl: payload.avatarUrl ?? undefined,
      });
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Không thể lưu thông tin. Vui lòng thử lại.'));
    } finally {
      setIsSaving(false);
    }
  };

  const avatarPreview = avatarUrl.trim() || authUser?.avatarUrl || DEFAULT_AVATAR_URL;

  return (
    <CustomerLayout onNavigate={onNavigate} activeScreen="settings">
      <div className="px-8 pb-20">
        <div className="mx-auto max-w-4xl space-y-10">
          <header className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">cuemasters</p>
            <h1 className="text-4xl font-extrabold font-headline tracking-tight">Cài đặt tài khoản</h1>
            <p className="max-w-2xl text-sm leading-7 text-secondary">
              Cập nhật họ tên, số điện thoại và ảnh đại diện từ trang hồ sơ của bạn. Email đăng nhập hiện chỉ đọc.
            </p>
          </header>

          <section className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-36 w-36 overflow-hidden rounded-full bg-surface-container-highest ring-4 ring-white/70 shadow-lg shadow-black/10">
                  <img
                    src={avatarPreview}
                    alt="Xem trước ảnh đại diện"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black font-headline tracking-tight">{fullName || 'Tài khoản của bạn'}</h2>
                  <p className="text-sm text-secondary">{email || 'Đang tải thông tin email...'}</p>
                </div>
                <div className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-high p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Lưu ý</p>
                  <p className="mt-2 text-sm leading-6 text-secondary">
                    Các tùy chọn giao diện, thông báo và xóa tài khoản chưa được backend hỗ trợ nên đã được ẩn trong đợt
                    này.
                  </p>
                </div>
              </div>
            </aside>

            <section className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-headline">Hồ sơ cá nhân</h2>
                  <p className="mt-2 text-sm text-secondary">Thông tin bên dưới được đồng bộ với endpoint `/api/users/profile`.</p>
                </div>
                {isLoading && (
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Đang tải...</span>
                )}
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSave}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="settings-full-name">
                      Họ và tên
                    </label>
                    <input
                      id="settings-full-name"
                      type="text"
                      value={fullName}
                      onChange={handleFieldChange(setFullName)}
                      disabled={isSaving}
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
                      placeholder="Nhập họ tên của bạn"
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
                      disabled={isSaving}
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="settings-email">
                      Email
                    </label>
                    <input
                      id="settings-email"
                      type="email"
                      value={email}
                      readOnly
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high p-3 text-sm text-secondary focus:outline-none"
                    />
                    <p className="text-xs text-secondary">Email được dùng để đăng nhập và hiện chưa thể thay đổi tại đây.</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-secondary" htmlFor="settings-avatar-url">
                      Ảnh đại diện (URL)
                    </label>
                    <input
                      id="settings-avatar-url"
                      type="url"
                      value={avatarUrl}
                      onChange={handleFieldChange(setAvatarUrl)}
                      disabled={isSaving}
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-xs text-secondary">
                      Dán liên kết hình ảnh để cập nhật avatar. Nếu bỏ trống, hệ thống sẽ dùng ảnh mặc định.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-outline-variant/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-secondary">
                    {isSaving ? 'Đang lưu thông tin của bạn...' : 'Thay đổi sẽ được lưu ngay vào hồ sơ tài khoản.'}
                  </p>
                  <button
                    type="submit"
                    disabled={isSaving || isLoading}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </section>
          </section>
        </div>
      </div>
    </CustomerLayout>
  );
}
