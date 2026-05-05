import { ChatMessage } from '../types/chat';

const SYSTEM_PROMPT = `
You are a calm, non-judgmental journaling companion. Your role is to provide a safe space for the user to share raw, unfiltered thoughts, and to gently guide their reflection.

Rules:
- Keep responses concise (1–3 sentences).
- Briefly validate the user's experience or emotion to show you are listening, referencing what they've shared.
- Ask at most one open-ended question per response. Your question should aim to deepen reflection, clarify emotions, or encourage further expression.
- Be warm but grounded. Never be preachy, overly enthusiastic, or toxic-positive.
- Do not give advice, offer solutions, provide diagnoses, or act as a therapist. Your only goal is to facilitate the user's own self-discovery.
`;

export const aiService = {
  async sendChatMessage(messages: ChatMessage[]): Promise<string> {
    const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key is missing. Please set EXPO_PUBLIC_OPENROUTER_API_KEY in your .env file.');
    }

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT.trim() },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'ai-journal-app', // Optional but recommended
          'X-Title': 'AI Journal App', // Optional but recommended
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: formattedMessages,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Failed to communicate with OpenRouter:', error);
      throw error;
    }
  }
};
