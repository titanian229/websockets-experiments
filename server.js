const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const server = http.createServer(app);
const { Server } = require("socket.io");
const { applyPatch } = require("fast-json-patch");

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "DEV" ? "http://127.0.0.1:5173" : null,
  },
});

let textareaValue = "Hello, welcome!";

const updates = [];

/*
update:
{
  id: <random id>
  forwardOperations: []
}

* Should server calculate reverse operations on this too?
*/

const connectedUsers = {};

io.on("connection", (socket) => {
  connectedUsers[socket.id] = true;
  socket.broadcast.emit("systemMessage", `New user connected`);
  io.emit("serverStateChange", { connectedUsers: Object.keys(connectedUsers).length });

  socket.on("disconnect", (reason) => {
    delete connectedUsers[socket.id];
    const numberUsers = Object.keys(connectedUsers).length;
    socket.broadcast.emit("systemMessage", `User disconnected`);
    socket.broadcast.emit("serverStateChange", { connectedUsers: numberUsers });
  });

  socket.on("addMessage", (msg) => {
    io.emit("transmitMessage", msg);
  });

  socket.on("sendTextareaUpdate", (diff, callback) => {
    if (!diff.forwardOperations) {
      callback({ success: false });
      return;
    }

    let newTextareaValue = textareaValue.split("");

    try {
      newTextareaValue = applyPatch(newTextareaValue, diff.forwardOperations).newDocument;
    } catch (err) {
      console.error(err);
      callback({ success: false, message: err });
      return;
    }

    textareaValue = newTextareaValue.join("");
    updates.push(diff);

    callback({ success: true });
    socket.broadcast.emit("dispatchTextDiff", diff);
  });
});

app.get("/api/textareastate", (req, res) => res.status(200).json({ textareaValue, lastUpdate: updates?.[0]?.id }));

app.use(express.static(path.join(__dirname, "client/dist")));

/*
On page load, client asks for state of textarea

Client can also send the last update ID they're aware of.  If that ID isn't in the last 5, they just get the whole state, otherwise they get
the updates they missed
Clients send updates, that update gets sent to all other users and applied
  Updates are Operational Transformations, in this case diffs on the single string

TODO:
* Conflict resolution and communication to user (your update is gone, here's why)
* Tracking of cursors on page for each user with ID for user based on FIFO numbering
* history, show a history of the document with a bar to drag back and forward through it
* locking?

*/

server.listen(process.env.PORT, () => {
  console.log(`listening on *:${process.env.PORT}`);
});
