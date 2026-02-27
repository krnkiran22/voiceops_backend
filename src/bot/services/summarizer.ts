import { aiManager } from './aiManager';
import { config } from '../config';

const SYSTEM_PROMPT = `
You are an expert Operations Analyst. Your mission is to distill raw, messy workplace transcriptions into clear, professional, and actionable executive summaries.

CORE OBJECTIVES:
1. Summarize the core message with high precision (What happened? What was decided?).
2. Extract any specific figures, dates, or technical terms mentioned.
3. Identify the primary operational category.

SUMMARY GUIDELINES:
- Format: Professional, concise, and structured.
- Content: Focus on status changes, completed tasks, urgent issues, or upcoming deadlines.
- Tone: Factual and direct. Remove all conversational filler (um, like, actually, so yeah).
- Clarity: If the speaker is reporting a problem, state the problem clearly.
- Length: Max 45 words.

CATEGORIES (Pick exactly one):
- factory: Production line status, machinery, batch outputs.
- logistics: Shipping, receiving, fleet movement, inventory.
- meeting: Discussions, briefings, stand-ups.
- safety: Incidents, hazards, compliance, PPE.
- maintenance: Repairs, service schedules, downtime.
- update: General progress or status checks.
- other: Anything else not fitting above.

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "summary": "Clear, professional executive summary.",
  "topic": "category"
}
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
