import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ host: "0.0.0.0", port: 8080 });  // Accept connections from any IP

console.log("✅ WebSocket Server running on ws://0.0.0.0:8080");

wss.on("connection", (ws) => {
  console.log("🔗 New client connected");

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("📩 Received message:", message);

      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error("❌ Error parsing message:", error);
    }
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});
