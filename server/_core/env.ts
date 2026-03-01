export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Support for alternative AI providers
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  /** OpenRouter image model; DALL-E 3 deprecated; options: flux.2-flex, flux.2-pro */
  openrouterImageModel: process.env.OPENROUTER_IMAGE_MODEL ?? "black-forest-labs/flux.2-flex",
  customLlmUrl: process.env.CUSTOM_LLM_URL ?? "",
};
