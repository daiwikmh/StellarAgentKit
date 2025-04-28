import React, { useState, useRef } from "react";
import { streamChatWithAgent } from "@/agent/agent"; // Adjust the import path as needed

const StellarChat = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentAssistantMsg, setCurrentAssistantMsg] = useState("");
  const sessionId = useRef("stellar-chat-session"); // You can make this dynamic if needed

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setInput("");
    setLoading(true);
    setCurrentAssistantMsg("");

    try {
      let assistantMsg = "";
      for await (const chunk of streamChatWithAgent(input, sessionId.current)) {
        // You may need to adjust this depending on the structure of your streamed chunk
        const token = chunk?.output ?? chunk?.content ?? String(chunk);
        assistantMsg += token;
        setCurrentAssistantMsg(assistantMsg);
      }
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: assistantMsg },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Error: " + (err as Error).message },
      ]);
    }
    setLoading(false);
    setCurrentAssistantMsg("");
  };

  return (
    <div>
      <h1>Stellar Agent Chat</h1>
      <div style={{ border: "1px solid #ccc", padding: 16, minHeight: 200, marginBottom: 16 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "8px 0" }}>
            <b>{msg.role === "user" ? "You" : "Agent"}:</b> {msg.content}
          </div>
        ))}
        {loading && (
          <div>
            <b>Agent:</b> {currentAssistantMsg}
            <span className="blinking-cursor">|</span>
          </div>
        )}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
        placeholder="Type your message..."
        disabled={loading}
        style={{ width: "80%", marginRight: 8 }}
      />
      <button onClick={handleSend} disabled={loading || !input.trim()}>
        Send
      </button>
    </div>
  );
};

export default StellarChat;