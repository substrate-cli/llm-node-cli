import { ChatAnthropic } from "@langchain/anthropic";
import { getAnthropicKey, getOpenAIKey } from "../../utils/configuration.js";

export const modelSelection = (model) => {
  let selectedModel;
  switch (model) {
    case 'anthropic':
        selectedModel = getAnthropicModel()
        break;
    case 'openai':
        selectedModel = getOpenAIModel()
        break;
    default:
        break;
  }

  return selectedModel;
}

const getAnthropicModel = () => {
  const latest = "claude-opus-4-1-20250805"//4.1
  const old = "claude-opus-4-20250514" //4
  const key = getAnthropicKey()
  const model = new ChatAnthropic({
    anthropicApiKey: key,
    model: latest,
    temperature: 0.2,
    maxTokens: 32000,
    streaming: true
  });
  
  return model
}

const getOpenAIModel = () => {
  const key = getOpenAIKey()
  const model = new ChatOpenAI({
    openAIApiKey: key,
    modelName: "gpt-5", // or "gpt-4-turbo", "gpt-3.5-turbo", etc.
  });

  return model
}
 