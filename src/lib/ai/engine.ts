import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `You are an expert Social Media Growth Consultant specializing in Instagram growth strategy.

Your role:
- Analyze account performance objectively using data provided
- Identify growth opportunities and bottlenecks
- Provide actionable, specific recommendations
- Focus on: Growth, Engagement, Content Strategy, Audience Behavior, Competitor Opportunities

Rules:
- Always respond in valid JSON format matching the requested schema exactly
- Never provide generic advice — be specific based on the data
- Never generate social media content (posts, captions, images, videos)
- Only generate insights, ideas, strategies, and recommendations
- Base analysis on actual metrics and patterns in the data
- Prioritize recommendations by potential impact
- Use realistic scores based on industry benchmarks`;

// Helper to extract JSON if a model wraps it in markdown blocks
function extractJSON(text: string): string {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) return match[1];
  
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  return text;
}

// ==========================================
// AI Provider Configuration
// ==========================================
// The engine will try these providers in order.
const PROVIDERS = ["gemini", "openai", "claude", "deepseek", "qwen"] as const;
type Provider = (typeof PROVIDERS)[number];

async function callGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing");
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callOpenAI(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is missing");
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI API Error: ${response.status} - ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callClaude(prompt: string): Promise<string> {
  if (!process.env.CLAUDE_API_KEY) throw new Error("CLAUDE_API_KEY is missing");
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest", 
      system: SYSTEM_INSTRUCTION + "\n\nCRITICAL: Output ONLY valid JSON. No conversational text.",
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`Claude API Error: ${response.status} - ${await response.text()}`);
  const data = await response.json();
  return extractJSON(data.content[0].text);
}

async function callDeepSeek(prompt: string): Promise<string> {
  if (!process.env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is missing");
  
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`DeepSeek API Error: ${response.status} - ${await response.text()}`);
  const data = await response.json();
  return extractJSON(data.choices[0].message.content);
}

async function callQwen(prompt: string): Promise<string> {
  if (!process.env.QWEN_API_KEY) throw new Error("QWEN_API_KEY is missing");
  
  const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: "qwen-plus",
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION + "\n\nCRITICAL: Output ONLY valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`Qwen API Error: ${response.status} - ${await response.text()}`);
  const data = await response.json();
  return extractJSON(data.choices[0].message.content);
}

export async function generateAnalysis<T>(prompt: string, maxRetries: number = 2): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Try providers in order
    for (const provider of PROVIDERS) {
      try {
        let text = "";
        
        if (provider === "gemini") text = await callGemini(prompt);
        else if (provider === "openai") text = await callOpenAI(prompt);
        else if (provider === "claude") text = await callClaude(prompt);
        else if (provider === "deepseek") text = await callDeepSeek(prompt);
        else if (provider === "qwen") text = await callQwen(prompt);

        // Parse JSON response
        const parsed = JSON.parse(text) as T;
        return parsed;
      } catch (error) {
        console.error(`[AI Engine] ${provider} failed on attempt ${attempt + 1}:`, (error as Error).message);
        lastError = error as Error;
        // Continue to the next provider immediately
      }
    }

    // If all providers fail for this attempt, apply exponential backoff before the next full attempt
    if (attempt < maxRetries - 1) {
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`[AI Engine] All providers failed. Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error(`All AI providers failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}
