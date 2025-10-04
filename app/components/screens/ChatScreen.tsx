"use client";

import { useState } from "react";
import { useTabletRouter } from "../tablet/TabletContext";
import { ArrowLeft, Send } from "lucide-react";

const initialMessages = [
  {
    id: 1,
    sender: "Mission Control",
    text: "Welcome to Mars Base Alpha",
    time: "10:30",
  },
  { id: 2, sender: "You", text: "Status report?", time: "10:31" },
  {
    id: 3,
    sender: "Mission Control",
    text: "All systems nominal. Rover operational.",
    time: "10:32",
  },
];

export default function ChatScreen() {
  const { goTo } = useTabletRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "You",
        text: inputText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setInputText("");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/40 rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-slate-700/50">
        <button
          onClick={() => goTo("apps")}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Mission Chat</h2>
          <p className="text-xs text-slate-400">Mission Control • Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "You" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                msg.sender === "You"
                  ? "bg-blue-500/30 text-white"
                  : "bg-slate-700/50 text-white"
              }`}
            >
              <p className="text-sm font-medium mb-1">{msg.sender}</p>
              <p>{msg.text}</p>
              <p className="text-xs text-slate-400 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800/50 text-white px-4 py-3 rounded-xl border border-slate-600/50 focus:outline-none focus:border-blue-500/50"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500/30 hover:bg-blue-500/50 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
