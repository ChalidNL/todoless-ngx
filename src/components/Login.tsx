import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppLogo } from './shared/AppLogo';
import { Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onSwitchToRegister?: () => void;
}

export const Login = ({ onLogin, onSwitchToRegister }: LoginProps) => {
  const { users, updateAppSettings } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    const user = users.find(u => u.email === email);
    if (!user) {
      setError('User not found. Please contact your administrator for an invite.');
      return;
    }
    
    updateAppSettings({ currentUserId: user.id });
    onLogin();
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <AppLogo size="lg" showText={true} variant="dark" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
        <p className="text-neutral-600 text-center mb-8 text-sm">
          Sign in to your Todoless account
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-600 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-neutral-900 text-white py-3 rounded-lg hover:bg-neutral-800 transition-colors font-medium"
          >
            Log In
          </button>

          <div className="text-center pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-500">
              Don't have an account? Contact your administrator for an invite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};