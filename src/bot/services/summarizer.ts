import { aiManager } from './aiManager';
import { config } from '../config';

const SYSTEM_PROMPT = `
You are a Lead Operations Analyst. Transform raw, informal workplace updates into comprehensive, structured executive reports.

CORE OBJECTIVES:
1. DATA PRECISION: Extract every quantity, count, percentage, or specific figure mentioned (e.g., 67 devices, 3 missing).
2. FEEDBACK CAPTURE: Explicitly record qualitative feedback, complaints, or comfort issues reported by staff.
3. ACTIONABLE INSIGHTS: Highlight specific problems, blockers, or required actions.

SUMMARY GUIDELINES:
- Format: Professional and descriptive. Do not be overly brief; ensure "the why" and "the how much" are included.
- Content: Combine quantitative data (numbers) with qualitative context (reasons/feedback).
- Tone: Direct, operational, and factual. Strip all conversational filler.
- Structure: Start with the most critical status or count, followed by details and feedback.
- Length: Max 75 words.

CATEGORIES (Pick exactly one):
- factory: Production line, machinery, output counts, manufacturing issues.
- logistics: Shipping, inventory levels, fleet, equipment distribution.
- meeting: Decisions, briefings, group discussions.
- safety: PPE compliance, incidents, hazards, health feedback.
- maintenance: Repairs, service, technical troubleshooting.
- update: General progress or mixed status reports.
- other: Topics not covered by the above.

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "summary": "Detailed, professional report including specific counts and feedback.",
  "topic": "category"
}
`;

export async function summarize(transcript: string): Promise<{ summary: string; topic: string }> {
    try {
        return await aiManager.execute(async (client) => {
            const isGroq = client.apiKey.startsWith('gsk_');
            const model = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o';

            console.log(`🧠 Summarizing with ${isGroq ? 'Groq' : 'OpenAI'} (${model})...`);

            const response = await client.chat.completions.create({
                model: model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: transcript }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            });

            let raw = response.choices[0].message.content ?? '{}';

            // Cleanup: Remove markdown backticks if they exist
            raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(raw);
        });
    } catch (error) {
        console.error('Summarization error after all retries:', error);
        return { summary: 'Update processed.', topic: 'update' };
    }
}
