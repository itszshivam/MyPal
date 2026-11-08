const STORAGE_KEYS = {
  MESSAGES: 'mypal_messages_v1',
  ACTIVE_COMPANION: 'mypal_active_companion',
  SETTINGS: 'mypal_settings',
  USER_PROFILE: 'mypal_user_profile'
};

export const defaultSettings = {
  theme: 'dark',
  soundEnabled: true,
  speechEnabled: true,
  streamTyping: true,
  companionPersonalityIntensity: 80,
  apiUrl: '',
  apiKey: '',
  modelName: 'gpt-4o-mini',
  useExternalApi: false
};

export const defaultUserProfile = {
  name: 'Alex',
  nickname: 'Adventurer',
  bio: 'Exploring ideas and building cool things.'
};

export function loadStoredData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
}

export function saveStoredData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export function exportChatAsFile(companionName, messages, format = 'json') {
  let content = '';
  let mimeType = 'application/json';
  let filename = `MyPal_${companionName}_chat.${format}`;

  if (format === 'markdown') {
    mimeType = 'text/markdown';
    filename = `MyPal_${companionName}_chat.md`;
    content = `# MyPal Chat Transcript with ${companionName}\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;
    messages.forEach((msg) => {
      const sender = msg.sender === 'user' ? 'You' : companionName;
      content += `### **${sender}** (${msg.timestamp})\n${msg.text}\n\n`;
    });
  } else {
    content = JSON.stringify({ companion: companionName, exportedAt: new Date().toISOString(), messages }, null, 2);
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { STORAGE_KEYS };
