import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateReply(inputText) {
  const prompt = `Balas tweet ini dengan gaya meme superhero, kritis, jenaka, dan relevan menggunakan bahasa inggris:\n\n"${inputText}"`;
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  });
  return res.choices[0].message.content;
}