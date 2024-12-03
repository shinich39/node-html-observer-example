let isReconnection = false;

function connect() {
  console.log("Start observer connection...");

  const socket = new WebSocket();

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