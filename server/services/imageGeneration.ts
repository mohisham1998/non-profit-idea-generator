/**
 * Slide image generation via DALL-E 3 through OpenRouter API.
 */
import { ENV } from "../_core/env";
import crypto from "crypto";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const DALL_E_MODEL = "openai/dall-e-3";

const CONTENT_TYPE_STYLES: Record<string, string> = {
  kpis: "analytics dashboard, data visualization, office environment",
  budget: "financial planning, budget documents, calculator, coins",
  swot: "strategic planning, business meeting, whiteboard",
  vision: "inspiring landscape, future vision, bright horizon",
  features: "innovation, technology, modern workspace",
  timeline: "calendar, roadmap, project timeline",
  team: "collaborative workspace, teamwork, meeting room",
  impact: "community impact, helping hands, social change",
  cover: "professional nonprofit presentation, inspiring",
  default: "professional workspace, modern, clean",
};

const INAPPROPRIATE_KEYWORDS = [
  "alcohol", "gambling", "weapon", "violence", "explicit", "nude",
];

function filterKeywords(keywords: string[]): string[] {
  const lower = keywords.map((k) => k.toLowerCase());
  return lower.filter((k) => !INAPPROPRIATE_KEYWORDS.some((bad) => k.includes(bad)));
}

/**
 * Build DALL-E 3 prompt from content type and keywords.
 * Filters inappropriate keywords, maps content type to visual style, enforces Saudi/charity context.
 */
export function constructPrompt(contentType: string, keywords: string[]): string {
  const safeKeywords = filterKeywords(keywords);
  const keywordsStr = safeKeywords.length > 0 ? safeKeywords.join(", ") : "nonprofit, charity";
  const style = CONTENT_TYPE_STYLES[contentType] ?? CONTENT_TYPE_STYLES.default;
  return `Professional realistic photograph for nonprofit presentation in Saudi Arabia: ${keywordsStr}. Style: ${style}. High quality, culturally appropriate, no text overlay, no people's faces, suitable for charity/nonprofit context.`;
}

export function hashPrompt(prompt: string): string {
  return crypto.createHash("sha256").update(prompt).digest("hex");
}

export type GenerateImageResult = {
  url?: string;
  base64?: string;
  width: number;
  height: number;
};

const RETRYABLE_STATUSES = [429, 503];
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, options);
    if (!RETRYABLE_STATUSES.includes(response.status) || attempt === MAX_RETRIES) {
      return response;
    }
    const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return fetch(url, options);
}

export async function generateSlideImage(prompt: string): Promise<GenerateImageResult> {
  const apiKey = ENV.openrouterApiKey;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured for image generation");
  }

  const response = await fetchWithRetry(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.VITE_APP_URL || "http://localhost:3000",
      "X-Title": "Nonprofit Ideas Generator",
    },
    body: JSON.stringify({
      model: DALL_E_MODEL,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image"],
    }),
  } as RequestInit);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Image generation failed (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: Array<{
          type?: string;
          image_url?: { url?: string };
        }>;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!Array.isArray(content) || content.length === 0) {
    throw new Error("No image in OpenRouter response");
  }

  const imageBlock = content.find((c) => c.type === "image_url" && c.image_url?.url);
  const url = imageBlock?.type === "image_url" ? imageBlock.image_url?.url : undefined;

  if (!url) {
    throw new Error("Invalid image response from OpenRouter");
  }

  let base64: string | undefined;
  if (url.startsWith("data:image")) {
    const match = url.match(/^data:image\/\w+;base64,(.+)$/);
    base64 = match?.[1];
  }

  return { url, base64, width: 1024, height: 1024 };
}
