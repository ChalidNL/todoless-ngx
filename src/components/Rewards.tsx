import React, { useState } from 'react';
import { Star, Trophy, Target, Gift, Plus } from 'lucide-react';
import { Progress } from './ui/progress';
import { GoalTracker } from './GoalTracker';

interface Reward {
  id: string;
  userId: string;
  points: number;
  reason: string;
  createdAt: number;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  pointsRequired: number;
  pointsCurrent: number;
  completed: boolean;
  userId: string;
}

export const Rewards = () => {
  // Placeholder state — will be wired to AppContext when Matt adds rewards/goals
  const [rewards] = useState<Reward[]>([]);
  const [goals] = useState<Goal[]>([]);
  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [awardPoints, setAwardPoints] = useState('');
  const [awardReason, setAwardReason] = useState('');

  const totalPoints = rewards.reduce((sum, r) => sum + r.points, 0);

  const handleAwardPoints = () => {
    const pts = parseInt(awardPoints);
    if (!pts || pts <= 0) return;
    // TODO: wire to context addReward
    setAwardPoints('');
    setAwardReason('');
    setShowAwardDialog(false);
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4">
      {/* Header */}
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          Rewards
        </h1>
      </div>

      {/* Points Balance Card */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8" />
          <div>
            <p className="text-sm opacity-90">Total Points</p>
            <p className="text-4xl font-bold">{totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Award Points Button (admin) */}
      <button
        onClick={() => setShowAwardDialog(!showAwardDialog)}
        className="w-full mb-4 flex items-center justify-center gap-2 py-3 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Award Points
      </button>

      {showAwardDialog && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4 mb-6 shadow-sm">
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Points"
              value={awardPoints}
              onChange={e => setAwardPoints(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Reason"
              value={awardReason}
              onChange={e => setAwardReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={handleAwardPoints}
              className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium"
            >
              Award
            </button>
          </div>
        </div>
      )}

      {/* Active Goals */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-blue-500" />
          Goals
        </h2>
        {goals.length === 0 ? (
          <p className="text-neutral-400 text-sm">No goals yet</p>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => (
              <GoalTracker key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>

      {/* Reward History */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-purple-500" />
          History
        </h2>
        {rewards.length === 0 ? (
          <p className="text-neutral-400 text-sm">No rewards earned yet</p>
        ) : (
          <div className="space-y-2">
            {rewards.map(reward => (
              <div key={reward.id} className="bg-white rounded-lg border border-neutral-200 p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{reward.reason}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(reward.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-yellow-600 font-bold">+{reward.points}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
