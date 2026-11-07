export async function generateCompanionResponse({
  companion,
  messages,
  userMessage,
  settings,
  onStreamChunk
}) {
  // If the user configured an external OpenAI-compatible API or custom endpoint
  if (settings.useExternalApi && settings.apiUrl) {
    try {
      const response = await fetch(settings.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {})
        },
        body: JSON.stringify({
          model: settings.modelName || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are ${companion.name}, ${companion.title}. Persona bio: ${companion.bio}. Traits: ${companion.traits.join(', ')}. Stay in character.`
            },
            ...messages.slice(-6).map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || data.reply || "I'm listening!";
      return content;
    } catch (err) {
      console.warn("External API failed, falling back to persona response generator:", err);
    }
  }

  // Persona Response Simulation
  const reply = craftPersonaReply(companion, userMessage);

  // If streaming is enabled, simulate character typing
  if (settings.streamTyping && onStreamChunk) {
    let current = '';
    const words = reply.split(' ');
    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      onStreamChunk(current);
      await new Promise((res) => setTimeout(res, Math.floor(Math.random() * 25) + 20));
    }
    return reply;
  }

  // Default brief realistic delay
  await new Promise((res) => setTimeout(res, 600));
  return reply;
}

function craftPersonaReply(companion, text) {
  const lower = text.toLowerCase();

  if (companion.id === 'aria') {
    if (lower.includes('sad') || lower.includes('tired') || lower.includes('hard') || lower.includes('overwhelm') || lower.includes('stress')) {
      return "I hear you, and it's completely okay to feel drained. Please be gentle with yourself today. Remember that taking a breather isn't quitting—it's recharging. What's one little thing you can do right now just for your peace of mind?";
    }
    if (lower.includes('thank') || lower.includes('appreciate')) {
      return "Aww, you're so welcome! Having you here genuinely brightens my day. I'm always just a message away whenever you need me. 💖";
    }
    if (lower.includes('grateful') || lower.includes('gratitude')) {
      return "Three simple joys: the warmth of a good drink, the gift of a fresh start every morning, and the courage you show every single day just by showing up. What's one thing you are grateful for today?";
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return "Hey there! It's so nice to hear from you. I was just wondering how things are going on your end. Tell me about your day!";
    }
    return `I love chatting with you! You always bring such an authentic perspective. Whatever is on your mind—big dreams, random thoughts, or little moments—I'm all ears.`;
  }

  if (companion.id === 'atlas') {
    if (lower.includes('react') || lower.includes('state') || lower.includes('code') || lower.includes('frontend') || lower.includes('javascript') || lower.includes('bug')) {
      return "State in modern React is essentially reactive memory: when the state variable updates, React re-renders that component's UI tree to reflect the new state. For apps like MyPal, combining local state (`useState`) with persistent storage (`localStorage`) or global context provides the sweet spot between agility and resilience.";
    }
    if (lower.includes('structure') || lower.includes('architecture') || lower.includes('full-stack')) {
      return "A clean architecture divides responsibilities: Presentation layer (React/Vite with Tailwind), State management / custom hooks, API service layer, and backend microservices or serverless endpoints. Keep your UI components dumb and focused on rendering, while lifting business logic into modular hooks.";
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return "Atlas online. Systems green. Ready to review code, brainstorm architectural blueprints, or solve your next technical roadblock. What are we building?";
    }
    return `Logical and efficient approach. Let's break this down into clear components: define the primary objective, isolate the bottlenecks, and execute iteratively. Where shall we start?`;
  }

  if (companion.id === 'nova') {
    if (lower.includes('story') || lower.includes('cyberpunk') || lower.includes('write')) {
      return "Rain drips through holographic billboards, washing neon violet across the wet pavement. In the alley of Sector 4, a stray cyber-cat purrs in binary. You glance at your wrist monitor: 03:42 AM. An incoming transmission pulses with an unknown signature... Shall we answer it?";
    }
    if (lower.includes('startup') || lower.includes('idea')) {
      return "Here are two wild sparks: 1) 'Ambient Memories'—an app that pairs your photos with an AI-composed personalized lo-fi soundtrack reflecting the mood. 2) 'Micro-Quests'—a gamified chrome extension that turns boring chores into retro RPG mini-bosses. Which concept calls to your imagination?";
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return "Greetings, star traveler! 🌟 The universe is brimming with untold stories and vibrant ideas. Let's create something electric together!";
    }
    return `That sparks an image in my mind! Imagination isn't about escaping reality; it's about seeing all the hidden dimensions within it. Let's take this concept one step further!`;
  }

  if (companion.id === 'sage') {
    if (lower.includes('anxious') || lower.includes('worry') || lower.includes('future') || lower.includes('fear')) {
      return "Marcus Aurelius wrote: 'Never let the future disturb you. You will meet it, if you have to, with the same weapons of reason which today arm you against the present.' Inhale for four counts, hold for four, and exhale slowly for six. The present moment is the only ground you stand upon.";
    }
    if (lower.includes('breath') || lower.includes('meditate') || lower.includes('calm')) {
      return "Let us pause together. Relax your shoulders. Unclench your jaw. Feel the steady support beneath your feet. Breathe in peace... breathe out tension. You are centered, you are safe, and you are capable.";
    }
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return "Peace be with you. In the busy rhythm of life, I welcome you to this calm harbor. What is present in your heart today?";
    }
    return `Observe the thought like a leaf drifting down a gentle stream. We need not react to every ripple in the water. We need only remain rooted like a cedar tree in the breeze.`;
  }

  return `I hear you loud and clear. Let's keep exploring this together!`;
}
