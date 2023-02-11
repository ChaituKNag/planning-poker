const express = require("express");
const { createServer } = require("http");
const { setupIO } = require("./io");

const app = express();
const httpServer = createServer(app);

setupIO(httpServer);

httpServer.listen(4000);