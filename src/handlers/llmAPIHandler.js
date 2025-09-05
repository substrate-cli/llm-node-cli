import { getCurrentModel } from "../../utils/configuration.js";
import CodeGeneration from "../consumers/codeGenerationConsumer.js";

let errorCount = 0;

export async function callLLMAPI(prompt, sysPrompt) {
  errorCount++;
  let responsetoconsumer = {};
  const model = getCurrentModel()
  if (errorCount < 4) {
    try {
      const codeGen = new CodeGeneration(prompt, model, sysPrompt);
      const res = await codeGen.initiateGeneration();

      if (res?.status === "finished") {
        responsetoconsumer.status = "finished";
        responsetoconsumer.code = res.code
        return responsetoconsumer;
      } else if (res?.status === "failed") {
        console.log("LLM Call failed, retrying code generation, retry count => ",errorCount)
        return await callLLMAPI(prompt);
      }
    } catch (err) {
      errorCount = 0
      responsetoconsumer.status = "failed"
      return responsetoconsumer
    }
  } 
  
  errorCount = 0;
  responsetoconsumer.status = "failed";
  return responsetoconsumer;
}