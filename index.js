"use strict";

import WebSocket from "websocket";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 3000;

const SCRIPT_DATA = fs.readFileSync("./script.js", "utf8")
  .replace("new WebSocket();", `new WebSocket("ws://127.0.0.1:${PORT}/");`)

const server = http.createServer((req, res) => {
  const url = req.url;
  const filePath = path.join(".", url);
  if (url === "/") {
    res.writeHead(302, { Location: "src/index.html" });
    res.end();
  } else if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end();
  } else if (path.extname(filePath) === ".html") {
    const data = fs
      .readFileSync(filePath, "utf8")
      .replace("</body>", `<script>${SCRIPT_DATA}</script></body>`);
    res.write(data);
    res.end();
  } else if (path.extname(filePath) !== "") {
    res.write(fs.readFileSync(filePath, "utf8"));
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, function () {
  console.log(`node-html-observer is listening on port ${PORT}`);
});

const socket = new WebSocket.server({
  httpServer: server,
  autoAcceptConnections: false,
});

socket.on("request", function (req) {
  const connection = req.accept();

  // connection.on('message', function(message) {
  //   if (message.type === 'utf8') {
  //       console.log('Received Message: ' + message.utf8Data);
  //       connection.sendUTF(message.utf8Data);
  //   }
  //   else if (message.type === 'binary') {
  //       console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
  //       connection.sendBytes(message.binaryData);
  //   }
  // });
});
