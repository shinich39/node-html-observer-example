"use strict";

import WebSocket from "websocket";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 3000;
const ROOT = "./src";

const SCRIPT_DATA = `
  let isReconnection = false;

  function connect() {
    console.log("Start observer connection...");

    const socket = new WebSocket("ws://127.0.0.1:${PORT}/");

    socket.addEventListener("open", (event) => {
      console.log("Connection succeeded");
      if (!isReconnection) {
        isReconnection = true;
      } else {
        window.location.reload();
      }
    });

    socket.addEventListener("close", (event) => {
      setTimeout(function() {
        connect();
      }, 128);
    });

    socket.addEventListener("error", (event) => {
      socket.close();
    });

    socket.addEventListener("message", (event) => {
      console.log("Message from observer ", event.data);
    });
  }

  connect();
`;

const server = http.createServer((req, res) => {
  const url = req.url;
  const filePath = path.join(ROOT, url);

  if (req.url === "/") {
    res.writeHead(302, { Location: "/index.html" });
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
  } else {
    res.write(fs.readFileSync(filePath, "utf8"));
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
