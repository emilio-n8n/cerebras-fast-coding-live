const { createServer } = require("http");
const { createProxyServer } = require("http-proxy");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const backendTarget = process.env.BACKEND_URL || "http://localhost:8000";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const proxy = createProxyServer({ target: backendTarget, ws: true });

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url);
    if (pathname === "/ws") {
      proxy.ws(req, socket, head);
    } else {
      socket.destroy();
    }
  });

  server.listen(port, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
});
