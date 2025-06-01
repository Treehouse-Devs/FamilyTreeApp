import { encode } from 'gpt-tokenizer';

const MAX_TOKENS_PER_BATCH = 3000;

interface Batch {
  filenames: string[];
  prompt: string;
}

export function buildPrompts(files: { filename: string; patch: string }[]): Batch[] {
  const batches: Batch[] = [];
  let current: Batch = { filenames: [], prompt: '' };
  let currentTokens = 0;

  for (const file of files) {
    const header = `\nDiff for \`${file.filename}\`:\n`;
    const content = header + '```diff\n' + file.patch + '\n```\n';
    const tokens = encode(content).length;
    if (currentTokens + tokens > MAX_TOKENS_PER_BATCH && current.filenames.length) {
      batches.push(current);
      current = { filenames: [], prompt: '' };
      currentTokens = 0;
    }
    current.filenames.push(file.filename);
    current.prompt += content;
    currentTokens += tokens;
  }
  if (current.filenames.length) batches.push(current);

  return batches.map(b => ({
    filenames: b.filenames,
    prompt: `You are an expert React Native and NestJS reviewer. Review the following diffs and suggest improvements:\n${b.prompt}`
  }));
}