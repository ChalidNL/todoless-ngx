import React from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { NewGlobalHeader } from './shared/NewGlobalHeader';

export const FiltersPage = () => {
  const { filters, deleteFilter, showCompletionMessage } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-0">
      <NewGlobalHeader
        showFilters={false}
        showSearch={false}
        showAdd={false}
        type="task"
      />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4">
          {/* Back + Title */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 hover:bg-neutral-100 rounded-md transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-600" />
            </button>
            <h1 className="text-xl font-semibold text-neutral-900">{t('filters.title')}</h1>
          </div>

          {filters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-neutral-500">{t('filters.noSavedFilters')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filters.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{f.name}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${f.type === 'task' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {f.type === 'task' ? t('common.tasks') : t('common.items')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {f.chipFilters?.length || f.labelIds.length || 0} condition{(f.chipFilters?.length || f.labelIds.length || 0) !== 1 ? 's' : ''}
                      {f.chipFilters?.map((cf: any) => (
                        <span key={cf.id} className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ backgroundColor: cf.color ? `${cf.color}20` : '#f3f4f6', color: cf.color || '#6b7280' }}
                        >{cf.label || cf.id}</span>
                      ))}
                    </p>
                  </div>
                  <button
                    onClick={() => { deleteFilter(f.id); showCompletionMessage(t('common.success')); }}
                    className="p-1.5 text-neutral-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors ml-2"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
