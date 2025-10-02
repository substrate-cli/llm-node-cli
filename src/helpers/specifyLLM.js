import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getAnthropicKey, getApiKey, getMode, getOpenAIKey, getSupportedModels, getGeminiKey } from "../../utils/configuration.js";

export const modelSelection = (model) => {
  let selectedModel;
  switch (model) {
    case 'anthropic':
        selectedModel = getAnthropicModel()
        break;
    case 'openai':
        selectedModel = getOpenAIModel()
        break;
    case 'gemini':
       selectedModel = getGeminiModel()    
    default:
        break;
  }

  return selectedModel;
}

export const checkIfValidModel = (model) => {
  let str = getSupportedModels();
  const supportedModels = str.split(",")
  return supportedModels.includes(model)
}

const getAnthropicModel = () => {
  const latest = "claude-opus-4-1-20250805"//4.1
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

const getGeminiModel = () => {
  const latest = "gemini-2.0-flash-exp" // Latest and fastest
  // const pro = "gemini-1.5-pro" 
  // const flash = "gemini-1.5-flash" 
  
  let key = getGeminiKey()
  if (getApiKey() !== "no-value" && getMode() == "cli") {
    key = getApiKey()
  }
  
  const model = new ChatGoogleGenerativeAI({
    apiKey: key,
    model: latest,
    temperature: 0.2,
    maxOutputTokens: 32000,
    streaming: true
  });
  
  return model
}
 

