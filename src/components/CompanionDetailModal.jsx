import { 
  X, 
  Heart, 
  BatteryCharging, 
  Sparkles, 
  Volume2
} from 'lucide-react';
import { speakText } from '../utils/audio';

export default function CompanionDetailModal({
  companion,
  isOpen,
  onClose,
  onSelectPrompt
}) {
  if (!isOpen || !companion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Background glow decoration */}
        <div 
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full bg-gradient-to-tr ${companion.gradient} opacity-20 blur-3xl pointer-events-none`} 
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Companion Header */}
        <div className="flex items-start space-x-4">
          <div
            className={`w-16 h-16 rounded-3xl bg-gradient-to-tr ${companion.gradient} flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/10 shrink-0`}
          >
            {companion.avatar}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white">
                {companion.name}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 font-medium">
                {companion.mood}
              </span>
            </div>
            <p className="text-xs text-indigo-400 font-semibold mt-0.5">
              {companion.title}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {companion.tagline}
            </p>
          </div>
        </div>

        {/* Affinity & Energy Stats */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" /> Affinity
              </span>
              <span className="font-bold text-white">{companion.affinity}%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${companion.affinity}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Mental Energy
              </span>
              <span className="font-bold text-white">{companion.energy}%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${companion.energy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bio Story */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Persona Origin & Mission
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
            {companion.bio}
          </p>
        </div>

        {/* Core Traits */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Personality Matrix
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {companion.traits.map((trait, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Voice Sample Preview */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 mb-4">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Voice: <strong className="text-white">{companion.voiceName}</strong></span>
          </div>
          <button
            onClick={() => speakText(`Hello! I'm ${companion.name}. It is lovely to connect with you.`, companion.id)}
            className="px-3 py-1 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Play Voice Sample
          </button>
        </div>

        {/* Starter Prompts */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Conversation Starters
          </h4>
          <div className="space-y-1.5">
            {companion.starterPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(p)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-indigo-500/10 border border-slate-700/50 hover:border-indigo-500/30 text-xs text-slate-300 hover:text-indigo-200 transition-colors truncate"
              >
                💬 {p}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/20"
        >
          Chat with {companion.name}
        </button>
      </div>
    </div>
  );
}
