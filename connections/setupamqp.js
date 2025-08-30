import amqp from 'amqplib';
import { callLLMAPI } from '../src/handlers/llmAPIHandler.js';
import { getSystemPrompToGenerateServerCode, getSystemPromptToGenerateAppCode, getSystemPromptToGenerateServerStructure } from '../utils/getSystemPrompt.js';
import appCode from '../src/consumers/app-code.json' with { type: "json" };
import serverCode from '../src/consumers/server-code.json' with { type: "json" };
import serverStruct from '../src/consumers/serverstruct.json' with { type: "json" };

export const setupAMQPConnection = async () => {

  const RABBITMQ_URL = "amqp://guest:guest@localhost:5672/";
  const EXCHANGE_NAME = "dev.topic.spinrequest";

  try {
    const connection = await amqp.connect(RABBITMQ_URL)
    const channel = await connection.createChannel()
    
    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

    const { queue } = await channel.assertQueue("", {
      exclusive: true, // Only this connection can use it, auto-deleted when closed
      durable: false,  // Not stored if broker restarts
    });

    const ROUTING_KEYS = ["spin.generateServerStruct.llmrequest", "spin.generateServerCode.llmrequest", "spin.generateAppCode.llmrequest"];
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

      switch (routingKey) {
        case "spin.generateServerStruct.llmrequest":
          const sysPrompt1 = getSystemPromptToGenerateServerStructure()

          llmResponse = await callLLMAPI(prompt, sysPrompt1)
          // llmResponse = {status:"finished", code:jsonRes}
          // const struct = serverStruct.code
          // llmResponse = {status:'finished', code: struct};
          console.log(JSON.stringify(llmResponse), "sssssss000000000")
          break;
        case "spin.generateServerCode.llmrequest":
          const sysPrompt2 = getSystemPrompToGenerateServerCode()
          llmResponse = await callLLMAPI(prompt, sysPrompt2) 
          // llmResponse = await timeoutAfter10SecondsAsync()
          // const code1 = serverCode.code
          // llmResponse = {status:'finished', code: code1};
          console.log(JSON.stringify(llmResponse), "sssssssss1111111111")
          break;
        case "spin.generateAppCode.llmrequest":
          let obj = JSON.parse(prompt)
          const userPrompt = obj.userPrompt
          const apiUrl = obj.baseApiUrl
          const appPort = obj.appPort
          delete obj.userPrompt
          delete obj.baseApiUrl
          const sysPrompt3 = getSystemPromptToGenerateAppCode(JSON.stringify(obj), apiUrl, appPort)
          llmResponse = await callLLMAPI(userPrompt, sysPrompt3)
          // const code2 = appCode.code
          // llmResponse = {status:'finished', code: code2};
          console.log(JSON.stringify(llmResponse), "sssssssssss22222222")
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

      // Acknowledge the message
      channel.ack(msg);

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
