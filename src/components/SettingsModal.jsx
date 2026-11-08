import { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Trash2, 
  Check, 
  Sparkles
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  userProfile,
  onSaveUserProfile,
  onResetAllData
}) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'profile' | 'api'
  const [localSettings, setLocalSettings] = useState(settings);
  const [localProfile, setLocalProfile] = useState(userProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onSaveUserProfile(localProfile);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">MyPal Preferences</h3>
              <p className="text-xs text-slate-400">Personalize your companion & app settings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            General & Voice
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Your Profile
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'api'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Backend / API
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Typewriter Stream Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <p className="text-sm font-medium text-slate-200">Simulate Typing Flow</p>
                  <p className="text-xs text-slate-400">Stream companion responses naturally word by word</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.streamTyping}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, streamTyping: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Text-to-speech auto play */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <p className="text-sm font-medium text-slate-200">Voice Audio Enabled</p>
                  <p className="text-xs text-slate-400">Enable text-to-speech engine for companion speech</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.speechEnabled}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, speechEnabled: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Reset storage button */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset all conversation history and preferences?")) {
                      onResetAllData();
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset All Local Storage Data</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={localProfile.name}
                  onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                  placeholder="e.g. Alex"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Nickname</label>
                <input
                  type="text"
                  value={localProfile.nickname}
                  onChange={(e) => setLocalProfile({ ...localProfile, nickname: e.target.value })}
                  placeholder="e.g. Ace, Captain, Friend"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">About You / Interests</label>
                <textarea
                  rows={3}
                  value={localProfile.bio}
                  onChange={(e) => setLocalProfile({ ...localProfile, bio: e.target.value })}
                  placeholder="Tell your companion what you enjoy (e.g. coding, music, running, writing)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:border-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                <Sparkles className="w-4 h-4 text-indigo-400 inline mr-1.5" />
                By default, MyPal runs with built-in instant responsive companion personas (no API keys required!).
                You can optionally link any OpenAI-compatible endpoint (like Ollama, LM Studio, or OpenAI).
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <p className="text-sm font-medium text-slate-200">Connect Custom API / LLM</p>
                  <p className="text-xs text-slate-400">Route prompts to external inference service</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.useExternalApi}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, useExternalApi: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
                />
              </div>

              {localSettings.useExternalApi && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      API Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={localSettings.apiUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, apiUrl: e.target.value })}
                      placeholder="e.g. http://localhost:11434/v1/chat/completions"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:border-indigo-500 outline-none font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      API Key (Bearer token, if required)
                    </label>
                    <input
                      type="password"
                      value={localSettings.apiKey}
                      onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:border-indigo-500 outline-none font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Model Name
                    </label>
                    <input
                      type="text"
                      value={localSettings.modelName}
                      onChange={(e) => setLocalSettings({ ...localSettings, modelName: e.target.value })}
                      placeholder="e.g. gpt-4o-mini, llama3, mistral"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:border-indigo-500 outline-none font-mono text-xs"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end space-x-3 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-white" /> : null}
            <span>{savedSuccess ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
