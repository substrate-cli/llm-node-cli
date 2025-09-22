import 'dotenv/config';

let apiKey = "no-value"
let currentModel = "";

export const setApiKey = (key) => {
   apiKey = key;
}

export const getApiKey = () => {
  return apiKey;
}

export const getAPIServerUrl = () => {
  return process.env.API_SERVER_URL;
}

export const getPort = () => {
  return process.env.PORT || 3000;
}

export const getAnthropicKey = () => {
  return process.env.ANTHROPIC_KEY || ""
}

export const getOpenAIKey = () => {
  return process.env.OPENAI_API_KEY || ""
}

export const getDefaultLLM = () => {
  return process.env.DEFAULT_LLM || "anthropic"
}

export const getMode = () => {
  return process.env.MODE || ""
}

export const getCurrentModel = () => {
  return currentModel
}

export const setCurrentModel = (model) => {
  currentModel = model
}

export const getAnthropicMaxTokens = () => {
  return process.env.ANTHROPIC_MAX_TOKENS || 32000
}

export const getEnvironment = () => {
  return process.env.ENVIRONMENT || "local"
}

export const getSupportedModels = () => {
  return process.env.SUPPORTED_LLMS
}