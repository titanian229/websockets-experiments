import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";

import { useToast, Heading, Text } from "@chakra-ui/react";

import { socket } from "./socket";
import SocketedTextarea from "./components/SocketedTextarea";

import "./App.css";
import ServerStats from "./components/ServerStats";

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  gap: 2rem;
  @media (min-width: 420px) {
    flex-direction: row-reverse;
  }
`;

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const onConnect = () => {
      toast({
        title: "Connected",
        description: "Connected to live state",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setIsConnected(true);
    };

    const onDisconnect = () => {
      toast({
        title: "Connection lost",
        description: "Live connection to server lost, attempting to reconnect",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      setIsConnected(false);
    };
    const onMessage = (value: string) => setMessages((messages: string[]) => [...messages, value]);

    const onSystemMessage = (message: string) =>
      toast({
        // title: "New user connected",
        description: message,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("transmitMessage", onMessage);
    socket.on("systemMessage", onSystemMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("transmitMessage", onMessage);
      socket.off("systemMessage", onSystemMessage);
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
      <Heading>Websockets Experiments</Heading>
      <Grid>
        <ServerStats isConnected={isConnected} />
        <SocketedTextarea isConnected={isConnected} />
      </Grid>
      <div style={{ marginBottom: "1em", marginTop: "1em" }}>
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
      <div>
        <form onSubmit={onSubmit}>
          <input onChange={(e) => setMessage(e.target.value)} value={message} />

          <button type="submit" disabled={isLoading}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
