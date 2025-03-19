import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ host: "0.0.0.0", port: 8080 });

console.log("✅ WebSocket Server running on ws://0.0.0.0:8080");

// Store rooms and their connected clients
const rooms: { [roomName: string]: Set<WebSocket> } = {};

wss.on("connection", (ws: WebSocket) => {
  console.log("🔗 New client connected");

  let userRoom: string | null = null; // Allow null initially

  ws.on("message", (data: string) => {
    try {
      const message = JSON.parse(data);
      console.log("📩 Received message:", message);

      if (message.type === "join" && typeof message.room === "string") {
        userRoom = message.room.trim();

        if (!rooms[userRoom as string]) {  // 🔥 Explicit type assertion
          rooms[userRoom as string] = new Set();
        }

        rooms[userRoom as string].add(ws);
        console.log(`🏠 User joined room: ${userRoom}`);
        return;
      }

      if (message.type === "message" && userRoom) {
        const msgData = JSON.stringify({
          sender: message.sender,
          text: message.text,
        });

        // Send message only to users in the same room
        rooms[userRoom as string]?.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(msgData);
          }
        });
      }
    } catch (error) {
      console.error("❌ Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    if (userRoom && rooms[userRoom as string]) {
      rooms[userRoom as string].delete(ws);

      // Remove empty room
      if (rooms[userRoom as string].size === 0) {
        delete rooms[userRoom as string];
      }
      console.log(`❌ Client disconnected from room: ${userRoom}`);
    }
  });
});
