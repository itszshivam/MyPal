// Text-to-speech helper using Web Speech API
export function speakText(text, companionId) {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip emojis and markdown formatting for smoother audio
  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voices = window.speechSynthesis.getVoices();

  // Configure voice characteristics by companion persona
  if (companionId === 'aria') {
    utterance.pitch = 1.15;
    utterance.rate = 1.0;
  } else if (companionId === 'atlas') {
    utterance.pitch = 0.9;
    utterance.rate = 1.05;
  } else if (companionId === 'nova') {
    utterance.pitch = 1.25;
    utterance.rate = 1.1;
  } else if (companionId === 'sage') {
    utterance.pitch = 0.85;
    utterance.rate = 0.88;
  }

  // Attempt to select an English voice
  if (voices.length > 0) {
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[companionId === 'atlas' || companionId === 'sage' ? 0 : englishVoices.length - 1];
    }
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
