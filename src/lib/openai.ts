import OpenAI from 'openai';

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OpenAI API key');
}

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, calls should be made through a backend
});
