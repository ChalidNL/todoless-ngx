import React, { useState } from 'react';
import { Inbox as InboxIcon, CheckSquare, ShoppingCart, FileText, Settings as SettingsIcon, CalendarDays, RefreshCw } from 'lucide-react';

type Screen = 'inbox' | 'tasks' | 'items' | 'notes' | 'calendar' | 'settings';

// Placeholder component for preview
function PreviewPlaceholder() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckSquare className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Todoless-ngx</h1>
        <p className="text-neutral-600 mb-6">
          Multi-user task management with PostgreSQL
        </p>
        <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-left text-sm">
          <p className="font-semibold mb-2">Features:</p>
          <ul className="space-y-1 text-neutral-600">
            <li>✓ Real-time multi-user sync</li>
            <li>✓ Private labels & filtering</li>
            <li>✓ Auto-archive completed tasks</li>
            <li>✓ Sprint planning & tracking</li>
            <li>✓ Invite-only registration</li>
            <li>✓ Docker deployment ready</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm">
          <p className="font-semibold text-blue-900 mb-1">Deploy with Docker:</p>
          <code className="text-xs text-blue-800 block bg-white p-2 rounded mt-2">
            docker-compose up -d
          </code>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <PreviewPlaceholder />;
}
