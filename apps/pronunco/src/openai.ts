export const openai = {
  chat: {
    completions: {
      async create(opts: any) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error("OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env.local file.");
        }
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify(opts),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`OpenAI API error: ${res.status} ${res.statusText} - ${errorData.error?.message || 'Unknown error'}`);
        }
        return res.json();
      },
    },
  },
};
export default openai;
