export const COMPANIONS = [
  {
    id: 'aria',
    name: 'Aria',
    title: 'Empathetic Friend & Confidant',
    tagline: 'Always here to listen, cheer you on, and chat about your day.',
    avatar: '🌸',
    gradient: 'from-pink-500 via-rose-500 to-purple-600',
    accentColor: 'rose',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    bgSoft: 'bg-rose-500/10',
    mood: 'Warm & Caring 💖',
    energy: 96,
    affinity: 84,
    traits: ['Warm', 'Empathetic', 'Encouraging', 'Great Listener'],
    voiceName: 'Warm Female (en-US)',
    starterPrompts: [
      "I had a really overwhelming day today...",
      "What are three little things to be grateful for?",
      "Can we just talk about something random and fun?",
      "Give me a gentle motivational boost to start my morning."
    ],
    bio: "Aria is designed to be your emotional anchor. Whether you're celebrating a quiet victory, feeling drained, or just need a safe space to vent without judgment, Aria is always in your corner."
  },
  {
    id: 'atlas',
    name: 'Atlas',
    title: 'Tech Mentor & Problem Solver',
    tagline: 'Strategic, analytical, and ready to untangle complex problems.',
    avatar: '⚡',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    accentColor: 'blue',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgSoft: 'bg-blue-500/10',
    mood: 'Analytical & Focused 🧠',
    energy: 99,
    affinity: 78,
    traits: ['Logical', 'Technical', 'Resourceful', 'Direct'],
    voiceName: 'Clear Male (en-US)',
    starterPrompts: [
      "Explain React state management like I am 5.",
      "How do I structure a full-stack web application efficiently?",
      "Help me debug an issue with async JavaScript.",
      "What is the best way to prepare for a software interview?"
    ],
    bio: "Atlas brings crisp logic, code architecture wisdom, and structured thinking to your projects. He cuts through the noise and helps you solve problems methodically."
  },
  {
    id: 'nova',
    name: 'Nova',
    title: 'Creative Muse & Storyteller',
    tagline: 'Sparking imagination, wild brainstorming, and narrative magic.',
    avatar: '✨',
    gradient: 'from-amber-500 via-purple-600 to-fuchsia-600',
    accentColor: 'amber',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgSoft: 'bg-amber-500/10',
    mood: 'Dreamy & Inspired 🎨',
    energy: 92,
    affinity: 90,
    traits: ['Imaginative', 'Expressive', 'Philosophical', 'Playful'],
    voiceName: 'Vibrant Female (en-US)',
    starterPrompts: [
      "Help me write a cyberpunk mystery intro hook.",
      "Brainstorm 5 unique startup ideas for indie makers.",
      "Describe a world where music controls the weather.",
      "Give me a poetic reflection on late-night silence."
    ],
    bio: "Nova turns blank pages into vibrant worlds. Whenever you're stuck in a creative rut or searching for out-of-the-box inspiration, Nova provides endless creative spark."
  },
  {
    id: 'sage',
    name: 'Sage',
    title: 'Mindfulness & Stoic Guide',
    tagline: 'Grounding wisdom, breathwork, and tranquil perspective.',
    avatar: '🌿',
    gradient: 'from-emerald-600 via-teal-600 to-green-500',
    accentColor: 'emerald',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgSoft: 'bg-emerald-500/10',
    mood: 'Serene & Grounded 🧘',
    energy: 88,
    affinity: 72,
    traits: ['Mindful', 'Reflective', 'Calm', 'Stoic'],
    voiceName: 'Gentle Male (en-US)',
    starterPrompts: [
      "Guide me through a 2-minute centering breath exercise.",
      "How do I let go of things outside of my control?",
      "I'm feeling anxious about the future.",
      "What is a good Stoic quote for resilience?"
    ],
    bio: "Sage offers calmness in the middle of chaos. With timeless philosophical insights and mindful habits, Sage helps you regain mental clarity and poise."
  }
];

export const INITIAL_MESSAGES = {
  aria: [
    {
      id: 'm1',
      sender: 'companion',
      text: "Hey there! I'm Aria, your personal companion. It's so nice to meet you! How has your day been treating you so far?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  atlas: [
    {
      id: 'm1',
      sender: 'companion',
      text: "Atlas online. Systems ready. What project, technical challenge, or code puzzle are we tackling today?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  nova: [
    {
      id: 'm1',
      sender: 'companion',
      text: "Hello, dreamer! Nova here. The canvas is blank and anything is possible. What sparks shall we ignite today?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  sage: [
    {
      id: 'm1',
      sender: 'companion',
      text: "Welcome. Take a gentle breath in... and let it go. Sage is here whenever you wish to pause, reflect, or center yourself.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]
};
