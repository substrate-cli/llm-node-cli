import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { getAnthropicKey, getApiKey, getMode, getOpenAIKey, getSupportedModels } from "../../utils/configuration.js";

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

export const checkIfValidModel = (model) => {
  const supportedModels = getSupportedModels().split(",")
  return supportedModels.includes(model)
}

const getAnthropicModel = () => {
  const latest = "claude-opus-4-1-20250805"//4.1
  const old = "claude-opus-4-20250514" //4
  let key = getAnthropicKey()
  if (getApiKey() !== "no-value" && getMode() == "cli") {
    key = getApiKey()
  }
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
  let key = getOpenAIKey()
  if (getApiKey() !== "no-value" && getMode() == "cli") {
    key = getApiKey()
  }
  const model = new ChatOpenAI({
    openAIApiKey: key,
    modelName: "gpt-5", // or "gpt-4-turbo", "gpt-3.5-turbo", etc.
  });

  return model
}
 

