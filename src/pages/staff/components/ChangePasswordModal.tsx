import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AdminModal } from '../../admin/components/AdminModal';
import { authService } from '../../../services/authService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (typeof (error as any).response?.data?.message === 'string' ||
      typeof (error as any).response?.data?.Message === 'string')
  ) {
    return (
      (error as any).response?.data?.message ||
      (error as any).response?.data?.Message ||
      fallbackMessage
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

const initialFeedback = null as { type: 'success' | 'error'; message: string } | null;

export const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(initialFeedback);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setFeedback(null);
      setIsSubmitting(false);
    }

    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen]);

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu.';
    }

    if (newPassword.length < 8) {
      return 'Mật khẩu mới phải có ít nhất 8 ký tự.';
    }

    if (newPassword !== confirmPassword) {
      return 'Xác nhận mật khẩu mới không khớp.';
    }

    if (newPassword === currentPassword) {
      return 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFeedback({ type: 'error', message: validationError });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', message: 'Đã đổi mật khẩu thành công.' });
      closeTimerRef.current = window.setTimeout(onClose, 1500);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Không thể đổi mật khẩu lúc này.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {feedback && (
          <div
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div>
          <label htmlFor="staffCurrentPassword" className="mb-2 block text-sm font-semibold text-neutral-800">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              id="staffCurrentPassword"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 pr-11 text-sm text-neutral-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              aria-label={showCurrent ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'}
              title={showCurrent ? 'Ẩn mật khẩu hiện tại' : 'Hiện mật khẩu hiện tại'}
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="staffNewPassword" className="mb-2 block text-sm font-semibold text-neutral-800">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              id="staffNewPassword"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 pr-11 text-sm text-neutral-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              aria-label={showNew ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
              title={showNew ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="staffConfirmPassword" className="mb-2 block text-sm font-semibold text-neutral-800">
            Xác nhận mật khẩu mới
          </label>
          <input
            id="staffConfirmPassword"
            type={showNew ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            autoComplete="new-password"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full bg-neutral-100 px-5 py-2 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-200 disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-container disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Đổi mật khẩu
          </button>
        </div>
      </form>
    </AdminModal>
  );
};
