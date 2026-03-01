import { ENV } from "./env";
import { jsonrepair } from "jsonrepair";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  /** US9: Model ID from OpenRouter (e.g. openai/gpt-4o). Falls back to default if not set. */
  model?: string;
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = () => {
  // Priority: Custom URL > OpenRouter > Forge API > OpenAI
  if (ENV.customLlmUrl && ENV.customLlmUrl.trim().length > 0) {
    return ENV.customLlmUrl.replace(/\/$/, "");
  }
  
  if (ENV.openrouterApiKey && ENV.openrouterApiKey.trim().length > 0) {
    return "https://openrouter.ai/api/v1/chat/completions";
  }
  
  if (ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0) {
    return `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`;
  }
  
  // Default to OpenAI if API key is provided
  if (ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) {
    return "https://api.openai.com/v1/chat/completions";
  }
  
  return "https://forge.manus.im/v1/chat/completions";
};

const getApiKey = () => {
  // Priority: Forge > OpenRouter > OpenAI > Custom
  return ENV.forgeApiKey || ENV.openrouterApiKey || ENV.openaiApiKey || "";
};

const assertApiKey = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "No API key configured. Please set one of: OPENAI_API_KEY, OPENROUTER_API_KEY, or BUILT_IN_FORGE_API_KEY"
    );
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    // Convert json_schema to json_object for broader model compatibility
    // Many models (like Gemini) don't support strict json_schema format
    if (explicitFormat.type === "json_schema") {
      console.log("[LLM] Converting json_schema to json_object for model compatibility");
      return { type: "json_object" };
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  // For outputSchema, also convert to json_object for compatibility
  console.log("[LLM] Converting outputSchema to json_object for model compatibility");
  return { type: "json_object" };
};

/**
 * Robustly extract a JSON object from an LLM response string.
 * Handles markdown code fences, leading/trailing text, truncated responses, and common quirks.
 */
export function extractJSON(raw: string): any {
  if (!raw) throw new Error("Empty LLM response");

  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```$/im, '')
    .trim();

  // 2. Try direct parse first
  try { return JSON.parse(cleaned); } catch {}

  // 3. Find the outermost JSON object or array and try to parse
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let start = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    const end = cleaned.lastIndexOf('}');
    if (end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
    }
  } else if (firstBracket !== -1) {
    start = firstBracket;
    const end = cleaned.lastIndexOf(']');
    if (end > start) {
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
    }
  }

  // 4. Try jsonrepair for truncated/malformed JSON (common when LLM hits token limit)
  try {
    const repaired = jsonrepair(cleaned);
    return JSON.parse(repaired);
  } catch {}

  throw new Error(`Could not parse LLM response as JSON. Raw (first 200): ${raw.slice(0, 200)}`);
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const defaultModel = "google/gemini-3-flash-preview";
  const payload: Record<string, unknown> = {
    model: params.model || defaultModel,
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens = params.maxTokens ?? params.max_tokens ?? 8192;

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    authorization: `Bearer ${getApiKey()}`,
  };

  // Add OpenRouter-specific headers if using OpenRouter
  if (ENV.openrouterApiKey && ENV.openrouterApiKey.trim().length > 0) {
    headers["HTTP-Referer"] = "https://nonprofit-ideas-generator.app";
    headers["X-Title"] = "Nonprofit Ideas Generator";
  }

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}
