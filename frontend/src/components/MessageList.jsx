import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { Sparkles } from 'lucide-react';

export default function MessageList({
  messages,
  companion,
  isTyping,
  streamingText,
  userProfile,
  onSelectPrompt
}) {
  const scrollRef = useRef(null);

  // Auto-scroll on messages change or when streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, streamingText]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-4 scroll-smooth"
    >
      {/* Empty State / Welcome Intro Card */}
      {messages.length <= 1 && (
        <div className="max-w-xl mx-auto my-6 p-6 rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/60 border border-slate-700/60 text-center shadow-xl">
          <div
            className={`w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr ${companion.gradient} flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/10 mb-4 animate-bounce`}
            style={{ animationDuration: '3s' }}
          >
            {companion.avatar}
          </div>

          <h3 className="text-xl font-bold text-slate-100">
            Meet {companion.name}
          </h3>
          <p className="text-xs font-semibold text-indigo-400 mt-0.5">
            {companion.title}
          </p>

          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            {companion.bio}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {companion.traits.map((trait, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/80"
              >
                ✨ {trait}
              </span>
            ))}
          </div>

          {/* Quick Starters */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-3">
              Try asking {companion.name}:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {companion.starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(prompt)}
                  className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/50 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all text-left flex items-start space-x-2 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="line-clamp-2">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Render Conversation Messages */}
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          companion={companion}
          userProfile={userProfile}
        />
      ))}

      {/* Live Streaming Message placeholder */}
      {streamingText && (
        <MessageItem
          message={{
            id: 'streaming-msg',
            sender: 'companion',
            text: streamingText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }}
          companion={companion}
          isStreaming={true}
          userProfile={userProfile}
        />
      )}

      {/* Typing Indicator */}
      {isTyping && !streamingText && (
        <div className="flex items-center space-x-3 my-4">
          <div
            className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${companion.gradient} flex items-center justify-center text-lg shadow-md ring-2 ring-slate-800`}
          >
            {companion.avatar}
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center space-x-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-xs text-slate-400 ml-2 font-medium">
              {companion.name} is thinking...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
