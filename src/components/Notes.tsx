import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NewGlobalHeader } from './shared/NewGlobalHeader';
import { TopBar } from './shared/TopBar';
import { Trash2, Pin, Tag, Lock, Unlock, Menu, X } from 'lucide-react';
import { LabelBadge } from './shared/LabelBadge';
import { EditableText } from './shared/EditableText';

// Helper to render note content with bullet points
const renderNoteContent = (content: string) => {
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    // Convert lines starting with * to bullet points
    if (line.trim().startsWith('* ')) {
      const text = line.trim().substring(2);
      return (
        <div key={idx} className="flex items-start gap-2 ml-4">
          <span className="text-neutral-600 mt-1">•</span>
          <span>{text}</span>
        </div>
      );
    }
    return <div key={idx}>{line || '\u00A0'}</div>;
  });
};

export const Notes = () => {
  const { notes, addNote, updateNote, deleteNote, labels } = useApp();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [showLabelSelector, setShowLabelSelector] = useState<string | null>(null);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleAddNote = (value: string) => {
    const newNote = {
      content: value,
      labels: [],
    };
    addNote(newNote);
  };

  const handleToggleLabel = (noteId: string, labelId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const currentLabels = note.labels || [];
    const hasLabel = currentLabels.includes(labelId);
    const newLabels = hasLabel
      ? currentLabels.filter(id => id !== labelId)
      : [...currentLabels, labelId];
    updateNote(noteId, { labels: newLabels });
  };

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: pinned first, then by creation date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Handle pinned notes
    const aPinned = a.pinned || false;
    const bPinned = b.pinned || false;
    
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    
    // If both pinned or both not pinned, sort by date
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <TopBar />
      <NewGlobalHeader 
        onSearch={setSearchQuery}
        onAdd={handleAddNote}
        searchPlaceholder="Search notes or add new..."
        type="note"
      />

      <div className="max-w-2xl mx-auto p-4">
        {/* Notes List */}
        {sortedNotes.length > 0 && (
          <div className="space-y-2">
            {sortedNotes.map((note) => {
              const isExpanded = expandedNoteId === note.id;
              const isShowingLabels = showLabelSelector === note.id;
              
              return (
                <div
                  key={note.id}
                  className={`bg-white rounded-lg border transition-all ${
                    isExpanded ? 'p-4 border-neutral-300' : 'p-3 border-neutral-200'
                  } ${note.pinned ? 'border-yellow-300 bg-yellow-50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {/* Pin indicator */}
                    {note.pinned && (
                      <Pin className="w-4 h-4 text-yellow-600 fill-yellow-600 flex-shrink-0 mt-0.5" />
                    )}

                    {/* Note Content (clickable to open detail modal) */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedNoteId(note.id)}
                    >
                      <div className="text-sm line-clamp-2">
                        {renderNoteContent(note.content || 'Empty note')}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Hamburger Menu Button - Right aligned */}
                    <button
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedNoteId(null);
                          setShowLabelSelector(null);
                        } else {
                          setExpandedNoteId(note.id);
                        }
                      }}
                      className="p-1.5 hover:bg-neutral-100 rounded transition-colors flex-shrink-0"
                    >
                      {isExpanded ? (
                        <X className="w-5 h-5 text-neutral-600" />
                      ) : (
                        <Menu className="w-5 h-5 text-neutral-400" />
                      )}
                    </button>
                  </div>

                  {/* Icon toolbar - only visible when menu is open */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <div className="flex items-center gap-1 mb-3">
                        {/* Tag - Labels */}
                        <button 
                          onClick={() => setShowLabelSelector(isShowingLabels ? null : note.id)}
                          className={`p-1.5 rounded transition-colors ${isShowingLabels ? 'bg-blue-100' : 'hover:bg-neutral-100'}`}
                          title="Labels"
                        >
                          <Tag className={`w-4 h-4 ${note.labels && note.labels.length > 0 ? 'text-blue-500' : 'text-neutral-400'}`} />
                        </button>
                        
                        {/* Pin */}
                        <button 
                          onClick={() => updateNote(note.id, { pinned: !note.pinned })}
                          className="p-1.5 rounded hover:bg-neutral-100 transition-colors"
                          title={note.pinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Pin className={`w-4 h-4 ${note.pinned ? 'text-yellow-600 fill-yellow-600' : 'text-neutral-400'}`} />
                        </button>

                        {/* Delete */}
                        <button 
                          onClick={() => {
                            if (confirm('Delete this note?')) {
                              deleteNote(note.id);
                            }
                          }}
                          className="p-1.5 rounded hover:bg-neutral-100 transition-colors ml-auto"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>

                      {/* Label Selector Panel */}
                      {isShowingLabels && (
                        <div className="bg-neutral-50 rounded p-3 mb-2">
                          <p className="text-xs font-medium text-neutral-600 mb-2">Select Labels</p>
                          <div className="flex flex-wrap gap-2">
                            {labels.map(label => {
                              const isSelected = note.labels && note.labels.includes(label.id);
                              return (
                                <button
                                  key={label.id}
                                  onClick={() => handleToggleLabel(note.id, label.id)}
                                  className={`px-2 py-1 rounded-full text-xs transition-opacity ${
                                    isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-60'
                                  }`}
                                  style={{ 
                                    backgroundColor: label.color,
                                    color: '#fff'
                                  }}
                                >
                                  {label.name}
                                </button>
                              );
                            })}
                            {labels.length === 0 && (
                              <p className="text-xs text-neutral-400">No labels available. Create labels in Settings.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Display selected labels */}
                      {note.labels && note.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.labels.map(labelId => {
                            const label = labels.find(l => l.id === labelId);
                            return label ? (
                              <LabelBadge 
                                key={labelId} 
                                label={label} 
                                size="sm"
                              />
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {sortedNotes.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Notes are for reflection and context</p>
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-neutral-500">
                {new Date(selectedNote.createdAt).toLocaleDateString()}
              </h3>
              <button
                onClick={() => updateNote(selectedNote.id, { pinned: !selectedNote.pinned })}
                className={`p-2 rounded hover:bg-neutral-100 ${
                  selectedNote.pinned ? 'text-yellow-600' : 'text-neutral-400'
                }`}
                title={selectedNote.pinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className={`w-5 h-5 ${selectedNote.pinned ? 'fill-yellow-600' : ''}`} />
              </button>
            </div>
            
            <textarea
              value={selectedNote.content}
              onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
              className="w-full min-h-[300px] px-3 py-2 border border-neutral-200 rounded resize-none focus:outline-none focus:border-neutral-400 text-sm"
              placeholder="Write your note here..."
            />

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setSelectedNoteId(null)}
                className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded"
              >
                Close
              </button>
              <button
                onClick={() => {
                  deleteNote(selectedNote.id);
                  setSelectedNoteId(null);
                }}
                className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};