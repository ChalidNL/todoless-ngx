import React, { useState } from 'react';
import { Plus, Check, Settings as SettingsIcon, Trash2 } from 'lucide-react';

interface ApiIntegration {
  id: string;
  name: string;
  type: 'home_assistant' | 'paperless' | 'actual_budget' | 'custom';
  apiUrl: string;
  apiKey: string;
  enabled: boolean;
}

export const ApiIntegrations = () => {
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'custom' as const,
    apiUrl: '',
    apiKey: '',
  });

  const integrationTypes = [
    { value: 'home_assistant', label: 'Home Assistant', placeholder: 'http://homeassistant.local:8123' },
    { value: 'paperless', label: 'Paperless-ngx', placeholder: 'http://paperless.local:8000' },
    { value: 'actual_budget', label: 'Actual Budget', placeholder: 'http://actual.local:5006' },
    { value: 'custom', label: 'Custom API', placeholder: 'https://api.example.com' },
  ];

  const handleAdd = () => {
    if (!newIntegration.name || !newIntegration.apiUrl) return;

    const integration: ApiIntegration = {
      id: Math.random().toString(36).substring(2, 11),
      name: newIntegration.name,
      type: newIntegration.type,
      apiUrl: newIntegration.apiUrl,
      apiKey: newIntegration.apiKey,
      enabled: true,
    };

    setIntegrations([...integrations, integration]);
    setShowAddModal(false);
    setNewIntegration({
      name: '',
      type: 'custom',
      apiUrl: '',
      apiKey: '',
    });
  };

  const handleToggle = (id: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === id ? { ...int, enabled: !int.enabled } : int
      )
    );
  };

  const handleDelete = (id: string) => {
    setIntegrations(prev => prev.filter(int => int.id !== id));
  };

  const selectedType = integrationTypes.find(t => t.value === newIntegration.type);

  return (
    <div>
      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 mb-4"
      >
        <Plus className="w-4 h-4" />
        Add Integration
      </button>

      {integrations.length > 0 && (
        <div className="space-y-3">
          {integrations.map(integration => (
            <div
              key={integration.id}
              className="flex items-center gap-3 p-3 border border-neutral-200 rounded bg-white"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{integration.name}</p>
                <p className="text-xs text-neutral-600">{integration.apiUrl}</p>
                <p className="text-xs text-neutral-400 capitalize mt-1">{integration.type.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(integration.id)}
                  className={`p-2 rounded transition-colors ${
                    integration.enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                  title={integration.enabled ? 'Enabled' : 'Disabled'}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(integration.id)}
                  className="p-2 hover:bg-neutral-100 rounded text-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add API Integration</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Integration Type</label>
                <select
                  value={newIntegration.type}
                  onChange={(e) =>
                    setNewIntegration({
                      ...newIntegration,
                      type: e.target.value as typeof newIntegration.type,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                >
                  {integrationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-600 mb-1">Name</label>
                <input
                  type="text"
                  value={newIntegration.name}
                  onChange={(e) =>
                    setNewIntegration({ ...newIntegration, name: e.target.value })
                  }
                  placeholder="My Home Assistant"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-600 mb-1">API URL</label>
                <input
                  type="url"
                  value={newIntegration.apiUrl}
                  onChange={(e) =>
                    setNewIntegration({ ...newIntegration, apiUrl: e.target.value })
                  }
                  placeholder={selectedType?.placeholder}
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-600 mb-1">
                  API Key / Token (optional)
                </label>
                <input
                  type="password"
                  value={newIntegration.apiKey}
                  onChange={(e) =>
                    setNewIntegration({ ...newIntegration, apiKey: e.target.value })
                  }
                  placeholder="Your API key or bearer token"
                  className="w-full px-3 py-2 border border-neutral-200 rounded"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newIntegration.name || !newIntegration.apiUrl}
                  className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Integration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};