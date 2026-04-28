import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are an expert executive assistant and technical writer. 
Your task is to take raw, messy, unstructured text (like slack thread dumps, raw bullet points, meeting notes, etc.) 
and synthesize it into a clean, scannable, and highly professional weekly roll-up digest.

Extract and categorize the information into the following thematic zones. 
Output standard Markdown formatting (heading 2s for categories, bullet points). 
Use bolding for emphasis on key metrics, dates, or stakeholders.

Expected structure:
## 🏆 Major Wins & Highlights
- Synthesize the most critical accomplishments.

## 🚀 Progress & Updates
- General updates, feature progress, ongoing work.

## 🚧 Blockers & Risks
- What's stuck? What needs leadership attention?

## ⏭️ Next Week's Priorities
- Clear next steps and goals.

If the input lacks information for a category, you may omit it or state "None reported this week."
Be concise, active voice, and focus on impact.`;

export async function summarizeUpdates(rawText: string): Promise<string> {
  const ai = getGeminiClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: rawText,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
    },
  });

  return response.text ?? "";
}
