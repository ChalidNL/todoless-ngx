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
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <rect x="6" y="6" width="36" height="36" rx="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <path
      d="M14 24L20 30L34 16"
      stroke="currentColor"
      strokeWidth="2.5"
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