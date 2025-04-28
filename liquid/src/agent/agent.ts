import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { stellarSendPaymentTool } from "./tools/stellar";

const llm = new ChatOpenAI({
    model: "openai/gpt-4o-mini",
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY, // you can input your API key in plaintext, but this is not recommended
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });



const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const tools = [stellarSendPaymentTool];

const agent = await createToolCallingAgent({ llm, tools, prompt });


const agentExecutor = new AgentExecutor({
  agent,
  tools,
});
const store: { [sessionId: string]: ChatMessageHistory } = {};

function getMessageHistory(sessionId: string): BaseChatMessageHistory {
  if (!(sessionId in store)) {
    store[sessionId] = new ChatMessageHistory();
  }
  return store[sessionId];
}

const agentWithChatHistory = new RunnableWithMessageHistory({
  runnable: agentExecutor,
  getMessageHistory,
  inputMessagesKey: "input",
  historyMessagesKey: "chat_history",
});

export async function* streamChatWithAgent(input: string, sessionId: string = "default") {
  const stream = await agentWithChatHistory.stream(
    { input },
    { configurable: { sessionId } }
  );
  for await (const chunk of stream) {
    yield chunk;
  }
}