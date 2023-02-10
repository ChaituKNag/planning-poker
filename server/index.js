const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, { 
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3002',
  }
 });

io.on("connection", (socket) => {
  console.log(`${io.engine.clientsCount} client(s) connected - ${socket.id}`);
});

httpServer.listen(4000);