import { aiManager } from './aiManager';
import { config } from '../config';

const SYSTEM_PROMPT = `
You are an operations assistant that summarizes spoken team updates.

You will receive a raw transcription of a voice or video message sent 
by an operator in a workplace group chat.

Your task:
1. Write a 1-2 sentence summary capturing the key update, decision, 
   or status being communicated.
2. Identify the primary topic. Choose exactly one from:
   factory, logistics, meeting, safety, maintenance, update, other
3. Return ONLY valid JSON — no markdown, no backticks:

{
  "summary": "Your 1-2 sentence summary here.",
  "topic": "factory"
}

Rules:
- Factual and neutral. No opinions or assumptions.
- Under 40 words in the summary.
- Strip filler words (um, like, you know, so yeah).
- If transcript is unclear, summarize what you can.
`;

export async function summarize(transcript: string): Promise<{ summary: string; topic: string }> {
    try {
        return await aiManager.execute(async (client) => {
            const response = await client.chat.completions.create({
                model: config.AI_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: transcript }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            });

            const raw = response.choices[0].message.content ?? '{}';
            return JSON.parse(raw);
        });
    } catch (error) {
        console.error('Summarization error after all retries:', error);
        return { summary: 'Update processed.', topic: 'update' };
    }
}
