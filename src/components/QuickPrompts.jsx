import { Sparkles } from 'lucide-react';

export default function QuickPrompts({ companion, onSelectPrompt }) {
  if (!companion?.starterPrompts) return null;

  return (
    <div className="px-4 lg:px-8 py-2 overflow-x-auto no-scrollbar flex items-center space-x-2 border-t border-slate-800/40 bg-slate-900/40">
      <div className="flex items-center text-xs font-semibold text-indigo-400 shrink-0 mr-1">
        <Sparkles className="w-3.5 h-3.5 mr-1" />
        <span className="hidden sm:inline">Suggestions:</span>
      </div>

      {companion.starterPrompts.map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(prompt)}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 hover:border-indigo-500/40 transition-all shadow-sm"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
