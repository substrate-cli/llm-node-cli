import 'dotenv/config';

export const getPort = () => {
  return process.env.PORT || 3000;
}

export const getAnthropicKey = () => {
  return process.env.ANTHROPIC_KEY || ""
}

export const getOpenAIKey = () => {
  return process.env.OPENAI_API_KEY || ""
}

const getDefaultLLM = () => {
  return process.env.DEFAULT_LLM || "anthropic"
}
