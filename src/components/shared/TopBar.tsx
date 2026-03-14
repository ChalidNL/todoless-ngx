import React from 'react';
import { AppLogo } from './AppLogo';

export const TopBar = () => {
  return (
    <div className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-center">
          <AppLogo size="md" showText={true} variant="light" />
        </div>
      </div>
    </div>
  );
};