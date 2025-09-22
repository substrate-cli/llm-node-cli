import amqp from 'amqplib';
import { callLLMAPI } from '../src/handlers/llmAPIHandler.js';
import { getSystemPromptForClone, getSystemPromptForUI, getSystemPrompToGenerateServerCode, getSystemPromptToGenerateAppCode, getSystemPromptToGenerateServerStructure } from '../utils/getSystemPrompt.js';
import { getAMQPURL, getCurrentModel, getDefaultLLM, getEnvironment, getExchangeName, getMode, setApiKey, setCurrentModel } from '../utils/configuration.js';
import { checkIfValidModel } from '../src/helpers/specifyLLM.js';

export const setupAMQPConnection = async () => {

  const amqpUrl = getAMQPURL();
  const EXCHANGE_NAME = getExchangeName();

  try {
    const connection = await amqp.connect(amqpUrl)
    const channel = await connection.createChannel()
    
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

    const { queue } = await channel.assertQueue("", {
      exclusive: true, // Only this connection can use it, auto-deleted when closed
      durable: false,  // Not stored if broker restarts
    });

    const ROUTING_KEYS = ["spin.generateServerStruct.llmrequest", "spin.generateServerCode.llmrequest", "spin.generateAppFSCode.llmrequest", "spin.generateAppCode.llmrequest", "spin.generateCloneAppCode.llmrequest"];
    for (const key of ROUTING_KEYS) {
      await channel.bindQueue(queue, EXCHANGE_NAME, key);
    }

    console.log(`[LLM Node] Waiting for messages on keys: ${ROUTING_KEYS.join(", ")}`);
    channel.consume(queue, async (msg) => {
      if (!msg) return;

      const { correlationId, replyTo } = msg.properties;
      const prompt = msg.content.toString();
      const routingKey = msg.fields.routingKey;

      console.log(`📥 Received (${routingKey}): "${prompt}" [correlationId: ${correlationId}]`);
      let llmResponse;
      let isError = false;
      try {
        let struct = JSON.parse(prompt)
          const key = struct?.["apiKey"]
          const model = struct?.["model"]
          if (model == "") {
            setCurrentModel(getDefaultLLM)
          }
          const isValid = checkIfValidModel(model)
          if (isValid) {
            setCurrentModel(model)
          } else {
            isError = true
            throw new Error("provided LLM is unsupported or is mispelled.")
          }
          if(key !== undefined) {
            setApiKey(key)
          }

      } catch(err) {
        console.log("error parsing prompt struct")
        console.log(err)
      }
     if(!isError) {
      switch (routingKey) {
        case "spin.generateServerStruct.llmrequest":
          if (getEnvironment() == "unitTest") {
            const struct = serverStruct.code
            llmResponse = {status:'finished', code: struct};
          } else {
            const sysPrompt1 = getSystemPromptToGenerateServerStructure()
            let serverStructObj = JSON.parse(prompt)
            llmResponse = await callLLMAPI(serverStructObj.prompt, sysPrompt1)
          }
           console.log(JSON.stringify(llmResponse), "sssssss000000000")
          break;
        case "spin.generateServerCode.llmrequest":
          if (getEnvironment() == "unitTest") {
           const code1 = serverCode.code
           llmResponse = {status:'finished', code: code1};
          } else {
            const sysPrompt2 = getSystemPrompToGenerateServerCode()
            llmResponse = await callLLMAPI(prompt, sysPrompt2) 
          }
          console.log(JSON.stringify(llmResponse), "sssssssss1111111111")
          break;
        case "spin.generateAppFSCode.llmrequest":
           if (getEnvironment() == "unitTest") {
             const code2 = appCode.code
             llmResponse = {status:'finished', code: code2};
          } else {
             let obj = JSON.parse(prompt)
             const userPrompt = obj.userPrompt
             const apiUrl = obj.baseApiUrl
             delete obj.userPrompt
             delete obj.baseApiUrl
             const sysPrompt3 = getSystemPromptToGenerateAppCode(JSON.stringify(obj), apiUrl)
             llmResponse = await callLLMAPI(userPrompt, sysPrompt3)
          }
          console.log(JSON.stringify(llmResponse), "sssssssss22222222")
          break;
        case "spin.generateAppCode.llmrequest":
          if (getEnvironment() == "unitTest") {
            const code3 = ui.code
            llmResponse = {status:'finished', code: code3}
          } else {
            const systemPrompt4 = getSystemPromptForUI()
            llmResponse = await callLLMAPI(prompt, systemPrompt4)
          }
          console.log(JSON.stringify(llmResponse), "sssssss3333333333")
          break;
        case "spin.generateCloneAppCode.llmrequest":
          if (getEnvironment() == "unitTest") {
            const code3 = ui.code
            llmResponse = {status:'finished', code: code3}
          } else {
            const systemPrompt5 = getSystemPromptForClone()
            llmResponse = await callLLMAPI(prompt, systemPrompt5)
            console.log(JSON.stringify(llmResponse), "ssssssssssssss444444444")
          }
          break;
        default:
          llmResponse = {status:'failed', error:`❌ Unknown routing key: ${routingKey}`};
          break;
      }

      // Call your LLM API
      // const llmResponse = await callLLMAPI(prompt);

      // Send the result back to the replyTo queue
       channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(llmResponse)), {
        replyTo:"spin.llmreply",
        correlationId, // Pass correlationId back for matching
        persistent: true, // Persist message in case of broker restart
       });
     }
      // Acknowledge the message
      channel.ack(msg);
      setApiKey("no-value")
      console.log(`📤 Sent LLM response back to ${replyTo} (correlationId: ${correlationId})`);
    });

  } catch (err) {
    console.error("❌ LLM Service Error:", err);
  }

}

async function timeoutAfter10SecondsAsync() {
    await new Promise(resolve => setTimeout(resolve, 10000));
    return { status: "failed" };
}
