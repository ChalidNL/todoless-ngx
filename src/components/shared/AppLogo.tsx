import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'light' | 'dark';
}

interface AppMarkProps {
  className?: string;
}

export const AppMark = ({ className = '' }: AppMarkProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M14.25 4.25H8.4C6.63369 4.25 5.2 5.68369 5.2 7.45V15.55C5.2 17.3163 6.63369 18.75 8.4 18.75H16.5C18.2663 18.75 19.7 17.3163 19.7 15.55V10.75"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 13.3L13.15 16.15L21.15 8.15"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AppLogo = ({ size = 'md', showText = true, variant = 'dark' }: AppLogoProps) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const colorClass = variant === 'light' ? 'text-white' : 'text-neutral-900';

  return (
    <div className="flex items-center gap-2">
      <AppMark className={`${sizes[size]} ${colorClass} shrink-0`} />
      {showText && (
        <span className={`font-semibold ${colorClass} ${textSizes[size]}`}>
          todoless-ngx
        </span>
      )}
    </div>
  );
};