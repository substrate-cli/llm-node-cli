import { getCurrentModel } from "../../utils/configuration.js";
import { errorHandler } from "../../webhooks/callApiWebhook.js";
import CodeGeneration from "../consumers/codeGenerationConsumer.js";

// export async function callLLMAPI(prompt, sysPrompt) {
//   errorCount++;
//   let responsetoconsumer = {};
//   const model = getCurrentModel()
//   if (errorCount < 4) {
//     try {
//       const codeGen = new CodeGeneration(prompt, model, sysPrompt);
//       const res = await codeGen.initiateGeneration();

//       if (res?.status === "finished") {
//         responsetoconsumer.status = "finished";
//         responsetoconsumer.code = res.code
//         return responsetoconsumer;
//       } else if (res?.status === "failed") {
//         console.log("LLM Call failed, retrying code generation, retry count => ",errorCount)
//         return await callLLMAPI(prompt);
//       }
//     } catch (err) {
//       errorCount = 0
//       responsetoconsumer.status = "failed"
//       return responsetoconsumer
//     }
//   } 
  
//   errorCount = 0;
//   responsetoconsumer.status = "failed";
//   return responsetoconsumer;
// }

export async function callLLMAPI(prompt, sysPrompt) {
  let errorCount = 0;
  let responsetoconsumer = {};
  const model = getCurrentModel()
    try {
      const codeGen = new CodeGeneration(prompt, model, sysPrompt);
      const res = await codeGeneration(codeGen, 0)
      
      if (res?.status === "finished") {
        responsetoconsumer.status = "finished";
        responsetoconsumer.code = res.code
      } else if (res?.status === "failed") {
        errorCount = 0
        responsetoconsumer.status = "failed"
      }
    } catch (err) {
      errorCount = 0
      responsetoconsumer.status = "failed"
      return responsetoconsumer
    }
  
  errorCount = 0;
  return responsetoconsumer;
}

async function codeGeneration(codeGen, errorCount = 0) {
  errorCount++
  let res;
  try {
    res = await codeGen.initiateGeneration();
    if (res?.status == "failed") {
      if (errorCount < 4) {
        console.log("LLM Call failed, retrying code generation, retry count => ",errorCount)
        await errorHandler("finished", "failed at code generation, retrying once again, DO NOT QUIT", "cluster init failed, retrying")
        return await codeGeneration(codeGen, errorCount)
      }
    }
   } catch(err) {
     console.log("error occured while code gen.")
     console.log(err)
     if (errorCount<4) {
       console.log("LLM Call failed, retrying code generation, retry count => ",errorCount)
       await errorHandler("finished", "failed at code generation, retrying once again, DO NOT QUIT", "cluster init failed, retrying")
       return await codeGeneration(codeGen, errorCount)
     }
  }

  return res
}