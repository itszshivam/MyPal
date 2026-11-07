import {
  Sparkles,
  Settings as SettingsIcon,
  Trash2,
  Heart,
  X,
  Volume2,
  VolumeX,
  LayoutDashboard,
  CreditCard,
  Bot,
  CircleDollarSign
} from 'lucide-react';

import { COMPANIONS } from '../data/companions';

export default function Sidebar({
  activeCompanionId,
  onSelectCompanion,
  isOpen,
  onClose,
  onOpenSettings,
  onOpenProfile,
  onClearCurrentChat,
  speechEnabled,
  onToggleSpeech,
  userProfile,
  onNavigate
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-80 bg-slate-900/95 lg:bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >

        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-xl">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                MyPal
              </h1>

              <p className="text-xs text-indigo-400 font-medium">
                AI Companion Suite
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">

            <button
              onClick={onToggleSpeech}
              title={
                speechEnabled
                  ? "Voice enabled (click to mute)"
                  : "Voice muted (click to unmute)"
              }
              className={`p-2 rounded-xl border transition-all ${
                speechEnabled
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {speechEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

          </div>
        </div>


        {/* MAIN NAVIGATION */}
        <div className="px-3 pt-4 pb-2">

          <div className="px-3 pb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            MyPal
          </div>

          <div className="space-y-1">

            {/* Dashboard */}
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>


            {/* Transactions */}
            <button
              onClick={() => onNavigate && onNavigate('transactions')}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Transactions</span>
            </button>


            {/* MyPal AI */}
            <button
              onClick={() => onNavigate && onNavigate('assistant')}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>MyPal AI</span>
            </button>


            {/* Payment Tracker */}
            <button
              onClick={() => onNavigate && onNavigate('payments')}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
            >
              <CircleDollarSign className="w-4 h-4" />
              <span>Payment Tracker</span>
            </button>

          </div>
        </div>


        {/* Divider */}
        <div className="mx-3 border-t border-slate-800/70" />


        {/* Companions Selection List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">

          <div className="px-3 pb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Select Your Companion
          </div>


          {COMPANIONS.map((companion) => {

            const isSelected =
              companion.id === activeCompanionId;

            return (
              <button
                key={companion.id}
                onClick={() => {
                  onSelectCompanion(companion.id);

                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`w-full text-left p-3 rounded-2xl transition-all duration-200 relative group flex items-start space-x-3.5 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-slate-800/90 to-slate-800/50 border-indigo-500/40 shadow-md shadow-indigo-500/5'
                    : 'bg-slate-900/40 hover:bg-slate-800/50 border-transparent hover:border-slate-800'
                }`}
              >

                {/* Active Indicator Bar */}
                {isSelected && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-indigo-500 to-pink-500 rounded-r-full" />
                )}


                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${companion.gradient} flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <span>{companion.avatar}</span>
                </div>


                {/* Companion Info */}
                <div className="flex-1 min-w-0">

                  <div className="flex items-center justify-between">

                    <span className="font-semibold text-sm text-slate-100 truncate">
                      {companion.name}
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
                      {companion.mood.split(' ')[0]}
                    </span>

                  </div>


                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {companion.title}
                  </p>


                  <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-400">

                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3 text-rose-400 fill-rose-400/20" />
                      <span>{companion.affinity}% affinity</span>
                    </div>

                    <span>•</span>

                    <div className="flex items-center space-x-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      <span>online</span>
                    </div>

                  </div>

                </div>

              </button>
            );
          })}


          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-slate-800/70 px-2 space-y-2">

            <button
              onClick={onClearCurrentChat}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              <span>Clear active chat memory</span>
            </button>

          </div>

        </div>


        {/* User Profile & Settings Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80">

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">

            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-3 text-left overflow-hidden flex-1 group"
            >

              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow">
                {userProfile.name
                  ? userProfile.name[0].toUpperCase()
                  : 'U'}
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                  {userProfile.name || 'Friend'}
                </p>

                <p className="text-[10px] text-slate-400 truncate">
                  {userProfile.nickname || 'Active User'}
                </p>

              </div>

            </button>


            <button
              onClick={onOpenSettings}
              title="Settings & API Configuration"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

          </div>

        </div>

      </aside>
    </>
  );
}