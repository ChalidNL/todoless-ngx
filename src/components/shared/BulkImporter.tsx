import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

type ImportType = 'task' | 'item' | 'calendar' | 'note';

export const BulkImporter = () => {
  const { addTask, addItem, addNote, addCalendarEvent } = useApp();
  const [importText, setImportText] = useState('');
  const [importType, setImportType] = useState<ImportType>('task');
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const handleImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n').filter(line => line.trim());
    let success = 0;
    let failed = 0;

    lines.forEach(line => {
      try {
        const trimmedLine = line.trim();
        
        switch (importType) {
          case 'task':
            // Parse format: "Task title @user #label //date !priority"
            let title = trimmedLine;
            let assignee: string | undefined;
            let labels: string[] = [];
            let dueDate: number | undefined;
            let priority: 'low' | 'normal' | 'high' = 'normal';

            // Extract @user
            const userMatch = trimmedLine.match(/@(\w+)/g);
            if (userMatch) {
              assignee = userMatch[0].substring(1);
              title = title.replace(/@\w+/g, '').trim();
            }

            // Extract #labels
            const labelMatch = trimmedLine.match(/#(\w+)/g);
            if (labelMatch) {
              labels = labelMatch.map(l => l.substring(1));
              title = title.replace(/#\w+/g, '').trim();
            }

            // Extract //date (format: //2024-12-31)
            const dateMatch = trimmedLine.match(/\/\/(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
              dueDate = new Date(dateMatch[1]).getTime();
              title = title.replace(/\/\/\d{4}-\d{2}-\d{2}/, '').trim();
            }

            // Extract !priority
            const priorityMatch = trimmedLine.match(/!(low|normal|high)/);
            if (priorityMatch) {
              priority = priorityMatch[1] as 'low' | 'normal' | 'high';
              title = title.replace(/!(low|normal|high)/, '').trim();
            }

            addTask({
              title: title || 'Untitled',
              status: 'backlog',
              blocked: false,
              labels: [],
              priority,
              assignedTo: assignee,
              dueDate,
            });
            success++;
            break;

          case 'item':
            // Parse format: "Item name #label $shop"
            let itemTitle = trimmedLine;
            let itemLabels: string[] = [];
            let shop: string | undefined;

            // Extract #labels
            const itemLabelMatch = trimmedLine.match(/#(\w+)/g);
            if (itemLabelMatch) {
              itemLabels = itemLabelMatch.map(l => l.substring(1));
              itemTitle = itemTitle.replace(/#\w+/g, '').trim();
            }

            // Extract $shop
            const shopMatch = trimmedLine.match(/\$(\w+)/);
            if (shopMatch) {
              shop = shopMatch[1];
              itemTitle = itemTitle.replace(/\$\w+/, '').trim();
            }

            addItem({
              title: itemTitle || 'Untitled',
              completed: false,
              labels: [],
              shop,
            });
            success++;
            break;

          case 'note':
            // Simple note import (just title)
            addNote({
              title: trimmedLine || 'Untitled',
              content: '',
              labels: [],
            });
            success++;
            break;

          case 'calendar':
            // Parse format: "Event title //2024-12-31 @10:00"
            let eventTitle = trimmedLine;
            let eventDate: number | undefined;
            let eventTime: string | undefined;

            // Extract //date
            const eventDateMatch = trimmedLine.match(/\/\/(\d{4}-\d{2}-\d{2})/);
            if (eventDateMatch) {
              eventDate = new Date(eventDateMatch[1]).getTime();
              eventTitle = eventTitle.replace(/\/\/\d{4}-\d{2}-\d{2}/, '').trim();
            }

            // Extract @time
            const timeMatch = trimmedLine.match(/@(\d{1,2}:\d{2})/);
            if (timeMatch) {
              eventTime = timeMatch[1];
              eventTitle = eventTitle.replace(/@\d{1,2}:\d{2}/, '').trim();
            }

            if (eventDate) {
              addCalendarEvent({
                title: eventTitle || 'Untitled',
                date: eventDate,
                time: eventTime,
                labels: [],
              });
              success++;
            } else {
              failed++;
            }
            break;
        }
      } catch (error) {
        failed++;
      }
    });

    setResult({ success, failed });
    setImportText('');
    
    // Clear result after 3 seconds
    setTimeout(() => setResult(null), 3000);
  };

  const getExampleText = () => {
    switch (importType) {
      case 'task':
        return `Fix login bug @john #urgent //2024-12-31 !high
Review PR #backend
Update documentation !low`;
      case 'item':
        return `Milk #groceries $supermarket
Bread #groceries
Laptop charger $electronics`;
      case 'note':
        return `Meeting notes for Q1 planning
Ideas for new features
Important contacts`;
      case 'calendar':
        return `Team meeting //2024-12-25 @10:00
Dentist appointment //2024-12-30 @14:30
Project deadline //2024-12-31`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Import
        </h3>

        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm text-neutral-600 mb-2">Import Type</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setImportType('task')}
                className={`px-3 py-2 rounded border text-sm transition-colors ${
                  importType === 'task'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setImportType('item')}
                className={`px-3 py-2 rounded border text-sm transition-colors ${
                  importType === 'item'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Items
              </button>
              <button
                onClick={() => setImportType('calendar')}
                className={`px-3 py-2 rounded border text-sm transition-colors ${
                  importType === 'calendar'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setImportType('note')}
                className={`px-3 py-2 rounded border text-sm transition-colors ${
                  importType === 'note'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                Notes
              </button>
            </div>
          </div>

          {/* Import text area */}
          <div>
            <label className="block text-sm text-neutral-600 mb-2">
              Paste your data (one per line)
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={getExampleText()}
              rows={8}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400 text-sm font-mono"
            />
            <p className="text-xs text-neutral-500 mt-2">
              {importType === 'task' && 'Format: Title @user #label //YYYY-MM-DD !priority'}
              {importType === 'item' && 'Format: Title #label $shop'}
              {importType === 'calendar' && 'Format: Title //YYYY-MM-DD @HH:MM'}
              {importType === 'note' && 'Format: Just the title/content'}
            </p>
          </div>

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={!importText.trim()}
            className="w-full px-4 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            <Upload className="w-4 h-4" />
            Import {importText.split('\n').filter(l => l.trim()).length} items
          </button>

          {/* Result message */}
          {result && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              result.failed === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {result.failed === 0 ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                Successfully imported {result.success} items
                {result.failed > 0 && `, ${result.failed} failed`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
