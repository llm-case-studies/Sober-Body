import React, { useState } from 'react';
import { useSettings } from '../features/core/settings-context';
import { LANGS } from '../../../../packages/pronunciation-coach/src/langs';
import { db } from '../db';
import { toast } from '../toast';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUpgrade = () => {
    setSettings(prev => ({ ...prev, isPro: true }));
    setShowUpgradeModal(false);
    toast.success('Pro mode activated! 🎉');
  };

  const handleReset = async () => {
    try {
      // Clear decks, scores, and other data but preserve locale
      await db().decks.clear();
      await db().cards.clear();
      await db().folders.clear();
      await db().friend_scores?.clear();
      
      // Reset settings except locale
      setSettings(prev => ({
        ...prev,
        isPro: false,
        strictness: 1,
        useAzure: false,
        offlineOnly: false,
        role: 'student'
      }));
      
      setShowResetConfirm(false);
      toast.success('All data reset successfully');
    } catch (error) {
      console.error('Reset failed:', error);
      toast.error('Failed to reset data');
    }
  };

  const getStrictnessLabel = (value: number) => {
    const labels = ['Casual', 'Balanced', 'Strict', 'Native'];
    return labels[value] || 'Balanced';
  };

  const hasAzureKey = !!import.meta.env.VITE_AZURE_SPEECH_KEY;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">⚙️ Settings</h1>
          </div>

          <div className="p-6 space-y-8">
            {/* Account Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">▸</span> Account
              </h2>
              
              <div className="ml-8 space-y-4">
                {/* Plan */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Plan</label>
                    <p className="text-sm text-gray-500">
                      {settings.isPro ? 'Pro' : 'Free'} - {settings.isPro ? 'AI drills & Azure scoring' : 'Basic features'}
                    </p>
                  </div>
                  {!settings.isPro && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                    >
                      Upgrade →
                    </button>
                  )}
                  {settings.isPro && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ✨ Pro Active
                    </span>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Role</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="student"
                        checked={settings.role === 'student'}
                        onChange={(e) => setSettings(prev => ({ ...prev, role: e.target.value as 'student' | 'teacher' }))}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Student</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="teacher"
                        checked={settings.role === 'teacher'}
                        onChange={(e) => setSettings(prev => ({ ...prev, role: e.target.value as 'student' | 'teacher' }))}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Teacher</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Pronunciation Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">▸</span> Pronunciation
              </h2>
              
              <div className="ml-8 space-y-4">
                {/* Strictness Slider */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Scoring Strictness: {getStrictnessLabel(settings.strictness)}
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">Casual</span>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      value={settings.strictness}
                      onChange={(e) => setSettings(prev => ({ ...prev, strictness: Number(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-xs text-gray-500">Native</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Controls how strict pronunciation scoring is across the app
                  </p>
                </div>

                {/* Azure Assessment */}
                {hasAzureKey && (
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Azure Assessment</label>
                      <p className="text-sm text-gray-500">Professional pronunciation scoring</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.useAzure}
                        onChange={(e) => setSettings(prev => ({ ...prev, useAzure: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* App Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">▸</span> App
              </h2>
              
              <div className="ml-8 space-y-4">
                {/* Language/Locale */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Language / Locale</label>
                  <select
                    value={settings.locale}
                    onChange={(e) => setSettings(prev => ({ ...prev, locale: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {LANGS.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label} ({lang.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Offline-first Only */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Offline-first Only</label>
                    <p className="text-sm text-gray-500">Disable cloud sync and stay local</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.offlineOnly}
                      onChange={(e) => setSettings(prev => ({ ...prev, offlineOnly: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Reset Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors"
                  >
                    Reset Decks & Data
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Clears all decks, scores, and settings (except locale)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Upgrade to Pro</h3>
            <p className="text-gray-700 mb-4">
              Pro mode unlocks AI-generated drills and Azure scoring.<br/>
              <span className="text-sm text-gray-500">(Billing page coming soon)</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              >
                Grant Free Pro Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-700">⚠️ Reset All Data</h3>
            <p className="text-gray-700 mb-4">
              This will permanently delete all your decks, scores, folders, and reset most settings. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
