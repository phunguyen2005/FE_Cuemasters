import { useState } from 'react';
import { Globe } from 'lucide-react';
import { isGoogleAuthConfigured } from '../../config/googleAuth';
import { createGoogleAuthorizationUrl } from '../../utils/googleOAuth';

interface GoogleAuthButtonProps {
  label: string;
  unavailableMessage: string;
  disabled?: boolean;
  onError: (message?: string) => void;
}

export default function GoogleAuthButton({
  label,
  unavailableMessage,
  disabled = false,
  onError,
}: GoogleAuthButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isDisabled = disabled || isRedirecting;

  const handleClick = async () => {
    if (isDisabled || !isGoogleAuthConfigured) {
      return;
    }

    setIsRedirecting(true);

    try {
      const authorizationUrl = await createGoogleAuthorizationUrl();
      window.location.assign(authorizationUrl);
    } catch (error) {
      setIsRedirecting(false);
      onError(error instanceof Error ? error.message : unavailableMessage);
    }
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
    <button
      className="flex min-h-[44px] w-full items-center justify-center gap-3 rounded-full border border-outline-variant/50 bg-surface-container-low py-4 font-bold text-on-surface transition-all duration-300 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      aria-busy={isDisabled || undefined}
    >
      <Globe className="h-5 w-5 text-secondary" />
      <span>{label}</span>
    </button>
  );
}
