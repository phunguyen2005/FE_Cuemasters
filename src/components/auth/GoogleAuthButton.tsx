import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Globe } from 'lucide-react';
import { isGoogleAuthConfigured } from '../../config/googleAuth';

interface GoogleAuthButtonProps {
  label: string;
  unavailableMessage: string;
  text: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
  onCredential: (idToken: string) => void | Promise<void>;
  onError: () => void;
}

export default function GoogleAuthButton({
  label,
  unavailableMessage,
  text,
  disabled = false,
  onCredential,
  onError,
}: GoogleAuthButtonProps) {
  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError();
      return;
    }

    void onCredential(credentialResponse.credential);
  };

  if (!isGoogleAuthConfigured) {
    return (
      <button
        className="flex w-full items-center justify-center gap-3 rounded-full border border-outline-variant/50 bg-surface-container-low py-4 font-bold text-on-surface transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        disabled
        title={unavailableMessage}
        aria-label={unavailableMessage}
      >
        <Globe className="h-5 w-5 text-secondary" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div
      className={`flex min-h-[44px] w-full justify-center ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      aria-busy={disabled || undefined}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={onError}
        text={text}
        theme="outline"
        size="large"
        shape="pill"
        logo_alignment="left"
        width={240}
      />
    </div>
  );
}
