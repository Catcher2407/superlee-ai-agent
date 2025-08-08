import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate AI reply untuk tweet dengan gaya meme superhero, kritis, jenaka
 * @param {string} inputText - teks tweet yang akan dibalas
 * @returns {Promise<string>} - balasan dari AI
 */
export async function generateReply(inputText) {
  try {
    const prompt = `Balas tweet ini dengan gaya meme superhero, kritis, jenaka, dan relevan menggunakan bahasa inggris:\n\n"${inputText}"`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
      max_tokens: 100,
    });

    return res.choices[0]?.message?.content?.trim() || '(no reply)';
  } catch (err) {
    console.error('❌ OpenAI Error:', err.message);
    return '(error generating reply)';
  }
}