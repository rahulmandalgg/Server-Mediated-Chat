import { WebSocketServer, WebSocket } from "ws";
import { serve } from "bun";


const wss = new WebSocketServer({ host: "0.0.0.0", port: 8080 });

console.log("✅ WebSocket Server running on ws://0.0.0.0:8080");

// Store rooms and their connected clients
const rooms: { [roomName: string]: Set<WebSocket> } = {};

wss.on("connection", (ws: WebSocket) => {
  console.log("🔗 New client connected");

  let userRoom: string | null = null;

  ws.on("message", (data: string) => {
    try {
      const message = JSON.parse(data);
      console.log("📩 Received message:", message);

      if (message.type === "join" && typeof message.room === "string") {
        userRoom = message.room.trim();

        if (!rooms[userRoom]) {
          rooms[userRoom] = new Set();
        }

        rooms[userRoom].add(ws);
        console.log(`🏠 User joined room: ${userRoom}`);
        return;
      }

      if (message.type === "message" && userRoom) {
        const msgData = JSON.stringify({
          sender: message.sender,
          text: message.text,
          timestamp: new Date().toISOString(),
        });

        rooms[userRoom]?.forEach((client) => {
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
    if (userRoom && rooms[userRoom]) {
      rooms[userRoom].delete(ws);

      if (rooms[userRoom].size === 0) {
        delete rooms[userRoom];
      }
      console.log(`❌ Client disconnected from room: ${userRoom}`);
    }
  });
});

// HTTP server for active rooms
serve({
  port: 8081,
  fetch(req) {
    const url = new URL(req.url);

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/active-rooms" && req.method === "GET") {
      const activeRooms = Object.keys(rooms).map((room) => ({
        room,
        clients: rooms[room].size,
      }));
      console.log("Sending active rooms with CORS headers...");
      return new Response(JSON.stringify(activeRooms), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // Allow all origins
        },
      });
    }

    // Upgrade WebSocket connection
    if (url.pathname === "/ws" && req.headers.get("upgrade") === "websocket") {
      const { socket, response } = Bun.upgradeWebSocket(req);
      wss.emit("connection", socket);
      return response;
    }

    return new Response("Not Found", { status: 404 });
  },
});


