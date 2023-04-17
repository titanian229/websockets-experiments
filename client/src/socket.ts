import { io, Socket } from "socket.io-client";

export type ServerResponse = {
  success: boolean;
};

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  transmitMessage: (message: string, callback: () => void) => void;
  dispatchTextDiff: (diff: any, callback: (response: ServerResponse) => void) => void;
  systemMessage: (message: string, callback: () => void) => void;
  serverStateChange: (state: any, callback: () => void) => void;
}

interface ClientToServerEvents {
  addMessage: (message: string, callback: () => void) => void;
  sendTextareaUpdate: (operationalTransforms: any[], callback: (response: ServerResponse) => void) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

// "undefined" means the URL will be computed from the `window.location` object
// const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3001";
// TODO: Set this to relative for dev mode and proxy it in vite config
const URL = "http://localhost:3001";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL);

// export const socket = io(URL);
