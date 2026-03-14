import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Upload, X } from 'lucide-react';

interface BulkImportProps {
  onClose: () => void;
}

export const BulkImport = ({ onClose }: BulkImportProps) => {
  const { addTask, addItem, addNote, users, labels, shops } = useApp();
  const [importType, setImportType] = useState<'task' | 'item' | 'note'>('task');
  const [importText, setImportText] = useState('');
  const [preview, setPreview] = useState<any[]>([]);

  const parseMetadata = (text: string) => {
    const assigneeMatch = text.match(/@(\w+)/);
    const labelMatches = text.match(/#(\w+)/g);
    const dateMatch = text.match(/\/\/(\d{4}-\d{2}-\d{2})/);
    const shopMatch = text.match(/\$(\w+)/);

    const assignee = assigneeMatch ? users.find(u => u.name.toLowerCase() === assigneeMatch[1].toLowerCase())?.id : undefined;
    const labelIds = labelMatches ? labelMatches.map(l => {
      const labelName = l.slice(1);
      return labels.find(label => label.name.toLowerCase() === labelName.toLowerCase())?.id;
    }).filter(Boolean) as string[] : [];
    
    const dueDate = dateMatch ? new Date(dateMatch[1]).getTime() : undefined;
    const shopId = shopMatch ? shops.find(s => s.name.toLowerCase() === shopMatch[1].toLowerCase())?.id : undefined;

    // Clean text by removing all metadata
    const cleanText = text
      .replace(/@\w+/g, '')
      .replace(/#\w+/g, '')
      .replace(/\/\/\d{4}-\d{2}-\d{2}/g, '')
      .replace(/\$\w+/g, '')
      .trim();

    return { assignee, labelIds, dueDate, shopId, cleanText };
  };

  const handlePreview = () => {
    const lines = importText.split('\n').filter(line => line.trim());
    const previewed = lines.map(line => {
      const { assignee, labelIds, dueDate, shopId, cleanText } = parseMetadata(line);
      
      return {
        text: cleanText,
        assignee: assignee ? users.find(u => u.id === assignee)?.name : undefined,
        labels: labelIds.map(id => labels.find(l => l.id === id)?.name).filter(Boolean),
        dueDate: dueDate ? new Date(dueDate).toLocaleDateString() : undefined,
        shop: shopId ? shops.find(s => s.id === shopId)?.name : undefined,
        raw: line
      };
    });
    
    setPreview(previewed);
  };

  const handleImport = () => {
    const lines = importText.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const { assignee, labelIds, dueDate, shopId, cleanText } = parseMetadata(line);
      
      if (importType === 'task') {
        addTask({
          title: cleanText,
          status: 'backlog',
          priority: 'normal',
          labels: labelIds,
          assignedTo: assignee,
          dueDate,
          horizon: null,
          sprint: null
        });
      } else if (importType === 'item') {
        addItem({
          title: cleanText,
          assigneeId: assignee,
          labelIds,
          dueDate,
          shopId
        });
      } else if (importType === 'note') {
        addNote({
          title: cleanText,
          content: '',
          labelIds
        });
      }
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Bulk Import</h3>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-600 mb-2">Import Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setImportType('task')}
              className={`flex-1 px-3 py-2 rounded border text-sm ${
                importType === 'task'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white border-neutral-200'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setImportType('item')}
              className={`flex-1 px-3 py-2 rounded border text-sm ${
                importType === 'item'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white border-neutral-200'
              }`}
            >
              Items
            </button>
            <button
              onClick={() => setImportType('note')}
              className={`flex-1 px-3 py-2 rounded border text-sm ${
                importType === 'note'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white border-neutral-200'
              }`}
            >
              Notes
            </button>
          </div>
        </div>

        {/* Import Instructions */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="font-semibold mb-2">Format Instructions:</p>
          <ul className="list-disc list-inside space-y-1 text-neutral-700">
            <li><strong>@username</strong> - Assign to user</li>
            <li><strong>#label</strong> - Add label</li>
            <li><strong>//YYYY-MM-DD</strong> - Set due date</li>
            <li><strong>$shopname</strong> - Assign shop (items only)</li>
            <li>One entry per line</li>
          </ul>
          <p className="mt-2 text-neutral-600">
            Example: <code className="bg-white px-1">Buy milk $albert #groceries @john //2026-03-15</code>
          </p>
        </div>

        {/* Text Area */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-600 mb-2">
            Paste your {importType}s (one per line)
          </label>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Buy milk $albert #groceries @john //2026-03-15&#10;Fix bug #urgent @alice //2026-03-14&#10;Write documentation #docs"
            className="w-full px-3 py-2 border border-neutral-200 rounded h-40 font-mono text-sm"
          />
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mb-4 max-h-60 overflow-y-auto border border-neutral-200 rounded">
            <div className="p-3 bg-neutral-50 border-b border-neutral-200 font-semibold text-sm">
              Preview ({preview.length} {importType}s)
            </div>
            <div className="divide-y divide-neutral-200">
              {preview.map((item, index) => (
                <div key={index} className="p-3 text-sm">
                  <p className="font-medium mb-1">{item.text}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
                    {item.assignee && (
                      <span className="px-2 py-0.5 bg-blue-100 rounded">@{item.assignee}</span>
                    )}
                    {item.labels?.map((label: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-100 rounded">#{label}</span>
                    ))}
                    {item.dueDate && (
                      <span className="px-2 py-0.5 bg-green-100 rounded">{item.dueDate}</span>
                    )}
                    {item.shop && (
                      <span className="px-2 py-0.5 bg-orange-100 rounded">${item.shop}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handlePreview}
            disabled={!importText.trim()}
            className="flex-1 px-4 py-2 border border-neutral-200 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview
          </button>
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import {importType === 'task' ? 'Tasks' : importType === 'item' ? 'Items' : 'Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};
