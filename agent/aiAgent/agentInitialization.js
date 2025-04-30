import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import {stellarTools} from "stellartools" ;

async function initializeAgent() {
  const llm = new ChatOpenAI({
    model: "openai/gpt-4o-mini",
    apiKey: process.env.OPENROUTER_API_KEY, // you can input your API key in plaintext, but this is not recommended
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
  



 
  // Get LangChain tools from the toolkit
  
 
  // Retrieve default tools from AgentKit

  const tools = 
     stellarTools
  ;

  // Set up memory and agent config
  const memory = new MemorySaver();
  const agentConfig = {
    configurable: { thread_id: "Staking and Agent Assistant" },
  };

  // Create agent with modified prompt for JSON formatting
  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
        You are a helpful agent.
    `,
  });

  return { agent, config: agentConfig };
}

export default initializeAgent;
