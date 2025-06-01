import OpenAI from 'openai';

const apiKey = process.env['OPENAI_API_KEY'];
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not set');
}

const openai = new OpenAI({
  apiKey,
});

export async function reviewBatch(prompt: string): Promise<string> {
  const model = process.env['OPENAI_MODEL'] || 'gpt-4o-mini'; // Note: Correct model name for GPT-4 mini
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 1000,
    temperature: 0.2,
    top_p: 1.0
  });
  return response.choices[0].message?.content || '';
}
