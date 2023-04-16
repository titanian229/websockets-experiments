import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import { compare, applyPatch } from "fast-json-patch";

import SocketedTextarea from "./components/SocketedTextarea";

import "./App.css";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onMessage = (value: string) => setMessages((messages: string[]) => [...messages, value]);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("transmitMessage", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("transmitMessage", onMessage);
    };
  }, []);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    socket.timeout(500).emit("addMessage", message, () => {
      setIsLoading(false);
      setMessage("");
    });
  };

  return (
    <div className="App">
      {/* TODO: messages to user, show users in page, loading state, error states, error recovery, someday maybe CSS? Also a chat window on the right side  */}
      <h1>WS Connected: {String(isConnected)}</h1>
      <div>
        <form onSubmit={onSubmit}>
          <input onChange={(e) => setMessage(e.target.value)} value={message} />

          <button type="submit" disabled={isLoading}>
            Submit
          </button>
        </form>
      </div>
      <div style={{ marginBottom: "1em" }}>
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
      <SocketedTextarea isConnected={isConnected} />
    </div>
  );
}

export default App;
