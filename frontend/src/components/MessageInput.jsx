import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  X
} from 'lucide-react';

export default function MessageInput({
  inputText,
  setInputText,
  onSendMessage,
  disabled,
  placeholder = "Message your companion..."
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // Voice Speech Recognition Setup
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Google Chrome or Microsoft Edge!");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (e) => {
        console.warn("Speech error:", e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    const trimmed = (inputText || '').trim();
    if (!trimmed && !attachment) return;

    onSendMessage(trimmed, attachment);
    setInputText('');
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`
      });
    }
  };

  return (
    <div className="p-4 lg:px-8 border-t border-slate-800/80 bg-slate-900/95 sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto">
        {/* Attachment Pill if selected */}
        {attachment && (
          <div className="mb-2 inline-flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-indigo-300">
            <Paperclip className="w-3 h-3 text-indigo-400" />
            <span className="truncate max-w-xs">{attachment.name}</span>
            <span className="text-[10px] text-slate-400">({attachment.size})</span>
            <button
              onClick={() => setAttachment(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Input Box */}
        <div className="flex items-end space-x-2 bg-slate-800/90 border border-slate-700/80 focus-within:border-indigo-500/60 rounded-3xl p-2.5 transition-all shadow-lg shadow-black/20 focus-within:ring-2 focus-within:ring-indigo-500/20">
          {/* File attach button */}
          <label 
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-2xl cursor-pointer transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Voice button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isRecording ? "Stop recording" : "Voice input"}
            className={`p-2 rounded-2xl transition-all ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening to your voice..." : placeholder}
            disabled={disabled}
            className="flex-1 max-h-36 py-2 px-2 bg-transparent text-sm text-slate-100 placeholder-slate-400 resize-none outline-none leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || (!inputText?.trim() && !attachment)}
            className={`p-2.5 rounded-2xl transition-all flex items-center justify-center ${
              inputText?.trim() || attachment
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:scale-105 active:scale-95'
                : 'text-slate-500 bg-slate-800/60 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Footnote */}
        <p className="text-[11px] text-center text-slate-400 mt-2 font-light">
          MyPal companions offer companionship & guidance. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/70 text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/70 text-[10px]">Shift+Enter</kbd> for newline.
        </p>
      </div>
    </div>
  );
}
