import { useState } from 'react';
import { 
  Menu, 
  Download, 
  Trash2, 
  Info, 
  ChevronDown, 
  FileText, 
  Code 
} from 'lucide-react';

export default function Header({
  companion,
  onOpenSidebar,
  onOpenCompanionBio,
  onExportChat,
  onClearChat
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="h-16 px-4 lg:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Active Companion Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div 
          onClick={onOpenCompanionBio}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Click to view companion bio & stats"
        >
          <div
            className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${companion.gradient} flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform`}
          >
            {companion.avatar}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm lg:text-base text-slate-100 group-hover:text-indigo-400 transition-colors">
                {companion.name}
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {companion.mood}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {companion.title}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenCompanionBio}
          className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
          title="Companion Profile & Bio"
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showExportMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onExportChat('markdown');
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold">Markdown (.md)</p>
                    <p className="text-[10px] text-slate-400">Formatted readable text</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onExportChat('json');
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors text-left"
                >
                  <Code className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="font-semibold">JSON (.json)</p>
                    <p className="text-[10px] text-slate-400">Raw transcript data</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClearChat}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Reset conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
