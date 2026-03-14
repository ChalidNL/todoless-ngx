import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Share2, Copy, Trash2, Plus } from 'lucide-react';

export const InviteManager = () => {
  const { inviteCodes, generateInviteCode, deleteInviteCode, showCompletionMessage } = useApp();
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentInviteUrl, setCurrentInviteUrl] = useState('');
  const [currentInviteCode, setCurrentInviteCode] = useState('');

  const handleGenerateInvite = () => {
    const invite = generateInviteCode();
    showCompletionMessage('Invite code gegenereerd!');
  };

  const handleShareInvite = (code: string) => {
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/register?invite=${code}`;
    setCurrentInviteUrl(inviteUrl);
    setCurrentInviteCode(code);
    setShowShareModal(true);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentInviteUrl);
    showCompletionMessage('URL gekopieerd!');
  };

  const handleWhatsAppShare = () => {
    const message = `Hey! You got an invite to todoless-ngx!\n\nCode: ${currentInviteCode}\n\nClick here to join: ${currentInviteUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <div className="mb-4">
        <button
          onClick={handleGenerateInvite}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Genereer Invite Code
        </button>
      </div>

      {inviteCodes.length > 0 ? (
        <div className="space-y-3">
          {inviteCodes.map((invite) => {
            const isExpired = invite.expiresAt < Date.now();
            const timeLeft = invite.expiresAt - Date.now();
            const minutesLeft = Math.floor(timeLeft / (60 * 1000));
            
            return (
              <div 
                key={invite.id} 
                className={`flex items-center gap-3 p-3 border rounded ${
                  isExpired ? 'bg-neutral-100 border-neutral-300' : 'bg-white border-neutral-200'
                }`}
              >
                <div className="flex-1">
                  <p className={`font-mono text-lg font-bold ${isExpired ? 'text-neutral-400 line-through' : 'text-blue-600'}`}>
                    {invite.code}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {isExpired ? (
                      <span className="text-red-500">Verlopen</span>
                    ) : invite.used ? (
                      <span className="text-neutral-500">Gebruikt op {new Date(invite.usedAt!).toLocaleString()}</span>
                    ) : (
                      <span className="text-green-600">Nog {minutesLeft} minuten geldig</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isExpired && !invite.used && (
                    <button
                      onClick={() => handleShareInvite(invite.code)}
                      className="p-2 hover:bg-neutral-100 rounded text-green-600"
                      title="Delen"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      deleteInviteCode(invite.id);
                      showCompletionMessage('Invite code verwijderd');
                    }}
                    className="p-2 hover:bg-neutral-100 rounded text-red-500"
                    title="Verwijderen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded text-sm text-neutral-600">
          Geen actieve invite codes. Klik op "Genereer Invite Code" om een nieuwe te maken.
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Deel Invite</h3>
            
            <div className="space-y-4">
              {/* Code Display */}
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Invite Code</label>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded">
                  <p className="font-mono text-2xl font-bold text-center text-blue-600">{currentInviteCode}</p>
                </div>
              </div>

              {/* URL with Copy */}
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Invite Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentInviteUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded bg-neutral-50 text-sm"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800"
                    title="Kopieer URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Delen via WhatsApp
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full px-4 py-2 border border-neutral-200 rounded"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};