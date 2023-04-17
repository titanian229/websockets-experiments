import React, { useState, useEffect } from "react";
import { compare, applyPatch } from "fast-json-patch";
import { useToast, Textarea } from "@chakra-ui/react";

import { socket } from "../socket";

type SocketedTextareaProps = {
  isConnected: boolean;
};

const SocketedTextarea = ({ isConnected = false }: SocketedTextareaProps) => {
  const [textarea, setTextarea] = useState<string | null>(null);
  const [previousTextarea, setPreviousTextarea] = useState<string | null>(null);

  const toast = useToast();

  const getTextAreaState = async () => {
    // Get initial state of TextArea
    const initialTextAreaState = await fetch("/api/textareastate")
      .then((response) => response.json())
      .catch((err) => console.error(err));
    if (!initialTextAreaState?.textareaValue) {
      // TODO: Errors to user
      toast({
        title: "Error",
        description: "Server down",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setTextarea(initialTextAreaState.textareaValue);
  };

  const sendTextareaUpdate = async (operationalTransforms: any) => {
    socket.emit("sendTextareaUpdate", operationalTransforms, (response) => {
      if (!response.success === true) {
        toast({
          title: "Error",
          description: "Error sending update, resetting to server state",
          status: "error",
          duration: 5000,
          isClosable: true,
        });

        // If the update fails, erase local state and get state from server
        getTextAreaState();
      }
    });
  };

  useEffect(() => {
    const onDispatchTextDiff = (diff: any) => {
      setPreviousTextarea(null);
      setTextarea((textarea: string | null) => {
        const newValue = applyPatch(
          (textarea === null ? "" : textarea).split(""),
          diff.forwardOperations
        ).newDocument.join("");
        return newValue;
      });
    };

    socket.on("dispatchTextDiff", onDispatchTextDiff);

    return () => {
      socket.off("dispatchTextDiff", onDispatchTextDiff);
    };
  }, []);

  useEffect(() => {
    if (isConnected === false) return;
    // Get initial state of TextArea
    getTextAreaState();
  }, [isConnected]);

  useEffect(() => {
    setPreviousTextarea(textarea);
    // calculate update, send if update present
    if (!(typeof previousTextarea === "string" && typeof textarea === "string")) return;

    const patches = compare(previousTextarea, textarea);
    if (patches.length === 0) return;

    sendTextareaUpdate({
      forwardOperations: patches,
      id: String(Math.floor(Math.random() * 1000000)),
    });
  }, [textarea]);

  return (
    <div style={{ width: "100%" }}>
      <Textarea
        disabled={!isConnected}
        value={textarea === null ? "" : textarea}
        onChange={(event) => setTextarea(event.target.value)}
      />
    </div>
  );
};

export default SocketedTextarea;
