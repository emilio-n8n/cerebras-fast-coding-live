const http = require("http");
const path = require("path");
const httpProxy = require(path.join(__dirname, "frontend/node_modules/http-proxy"));

const proxy = httpProxy.createProxy({});
const PORT = 3000;

http
  .createServer((req, res) => proxy.web(req, res, { target: "http://localhost:3000" }))
  .on("upgrade", (req, socket, head) => {
    if (req.url === "/ws") {
      proxy.ws(req, socket, head, { target: "ws://localhost:8000" });
    } else {
      socket.destroy();
    }
  })
  .listen(PORT, "0.0.0.0", () => console.log(`Proxy ready on 0.0.0.0:${PORT}`));
