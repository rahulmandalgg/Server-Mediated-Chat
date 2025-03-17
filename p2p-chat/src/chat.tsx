import React, { useState, useEffect, useRef } from "react";

const WS_URL = `ws://${window.location.hostname}:8080`;

const Chat: React.FC = () => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [hasUsername, setHasUsername] = useState(false);

  useEffect(() => {
    if (!hasUsername || ws.current) return;

    console.log("🔄 Connecting to WebSocket...");
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("✅ Connected to WebSocket!");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📩 New message:", message);
        setMessages((prev) => [...prev, message]);
      } catch (error) {
        console.error("❌ Error parsing message:", error);
      }
    };

    ws.current.onerror = (err) => console.error("❌ WebSocket Error:", err);
    ws.current.onclose = () => {
      console.log("❌ WebSocket Disconnected!");
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
      ws.current = null;
    };
  }, [hasUsername]);

  const sendMessage = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.log("⚠️ WebSocket not connected.");
      return;
    }

    if (input.trim() !== "" && username.trim() !== "") {
      const message = { sender: username, text: input };
      console.log("🚀 Sending Message:", message);
      ws.current.send(JSON.stringify(message));
      setInput("");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#2c003e", // Deep purple background
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#3b003b", // Dark maroon
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "white",
        }}
      >
        {!hasUsername ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <h2 style={{ color: "#ffccff", marginBottom: "15px" }}>Enter Your Name</h2>
          
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: "90%",  // Reduced width to prevent stretching
              maxWidth: "100%",  // Keeps input box compact
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
              border: "1px solid #ff80ff",
              fontSize: "16px",
              background: "#4d004d",
              color: "white",
              textAlign: "center", // Center text inside input
            }}
          />
            <button
              onClick={() => setHasUsername(true)}
              disabled={username.trim() === ""}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                background: username.trim() !== "" ? "#ff0080" : "#660066",
                color: "white",
                fontSize: "16px",
                cursor: username.trim() !== "" ? "pointer" : "not-allowed",
              }}
            >
              Set Name
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ textAlign: "center", color: "#ffccff", marginBottom: "10px" }}>Welcome, {username}!</h3>
            <div
              style={{
                height: "300px",
                overflowY: "auto",
                border: "1px solid #ff80ff",
                padding: "10px",
                borderRadius: "5px",
                background: "#4d004d",
                marginBottom: "10px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    maxWidth: "75%",
                    alignSelf: msg.sender === username ? "flex-end" : "flex-start",
                    padding: "10px",
                    borderRadius: "10px",
                    background: msg.sender === username ? "#ff0080" : "#660066",
                    color: "white",
                    textAlign: msg.sender === username ? "right" : "left",
                    wordWrap: "break-word",
                  }}
                >
                  <strong>{msg.sender}</strong>: {msg.text}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", width: "100%" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ff80ff",
                  fontSize: "16px",
                  background: "#4d004d",
                  color: "white",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "10px 15px",
                  marginLeft: "10px",
                  borderRadius: "5px",
                  border: "none",
                  background: isConnected ? "#ff0080" : "#660066",
                  color: "white",
                  cursor: isConnected ? "pointer" : "not-allowed",
                }}
                disabled={!isConnected}
              >
                Send
              </button>
            </div>

            {!isConnected && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>⚠️ WebSocket not connected!</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
