import { modelSelection } from "../helpers/specifyLLM.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

class CodeGeneration {
    prompt;
    model;
    systemPrompt;

    constructor(prompt, model, sysPrompt) {
      this.model = modelSelection(model)
      this.prompt = prompt
      this.systemPrompt = sysPrompt
    }
   
    async initiateGeneration() {
        const messages = [
         new SystemMessage(this.systemPrompt),
         new HumanMessage(this.prompt)
    ];
      
    try {
      let llmResponse = await this.model.invoke(messages)
      console.log("Usage metadata => ",llmResponse?.usage_metadata)
      let raw = llmResponse.content
      raw = raw.replace(/^```(?:json)?\s*|\s*```$/g, "");
      const result = JSON.parse(raw);
      
      /// for streaming -----
      // let finalResponse = ""; ///for streaming ----
      // const stream = await this.model.stream([systemPrompt, userPromptMessage]);
      // for await (const chunk of stream) {
      //    const content = chunk.content || "";
      //    process.stdout.write(content); // Now writing string content
      //    finalResponse += content;  
      // }
      return {status: 'finished', code: result}
    } catch (err) {
      console.log("error occurred in llm api call", err)
      return {status: 'failed', error: err}
    }
  }
    

}

export default CodeGeneration