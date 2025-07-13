export const openai = {
  chat: {
    completions: {
      async create(opts: any) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` },
          body: JSON.stringify(opts),
        });
        return res.json();
      },
    },
  },
};
export default openai;
