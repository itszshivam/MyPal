import { useState } from 'react';
import { 
  Copy, 
  Check, 
  Volume2, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';
import { speakText } from '../utils/audio';

export default function MessageItem({
  message,
  companion,
  isStreaming,
  userProfile
}) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null); // true, false, null

  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    speakText(message.text, companion.id);
  };

  return (
    <div
      className={`group flex items-start gap-3 sm:gap-4 my-4 transition-all duration-200 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {userProfile?.name ? userProfile.name[0].toUpperCase() : 'U'}
          </div>
        ) : (
          <div
            className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${companion.gradient} flex items-center justify-center text-lg shadow-md ring-2 ring-slate-800`}
          >
            {companion.avatar}
          </div>
        )}
      </div>

      {/* Bubble & Metadata */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name & Timestamp */}
        <div className="flex items-center space-x-2 px-1 mb-1 text-[11px] text-slate-400">
          <span className="font-medium text-slate-300">
            {isUser ? (userProfile?.name || 'You') : companion.name}
          </span>
          <span>•</span>
          <span>{message.timestamp}</span>
        </div>

        {/* Message Content Bubble */}
        <div
          className={`p-3.5 sm:p-4 rounded-3xl text-sm leading-relaxed transition-all shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-indigo-600/10'
              : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-sm backdrop-blur-sm shadow-black/20'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.text}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" />
            )}
          </div>
        </div>

        {/* Action Toolbar on Companion Messages */}
        {!isUser && (
          <div className="flex items-center space-x-1 mt-1.5 px-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              title="Copy message"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleSpeak}
              title="Read aloud"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setLiked(liked === true ? null : true)}
              title="Helpful"
              className={`p-1.5 rounded-lg transition-colors ${
                liked === true ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setLiked(liked === false ? null : false)}
              title="Not helpful"
              className={`p-1.5 rounded-lg transition-colors ${
                liked === false ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
