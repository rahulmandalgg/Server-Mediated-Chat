import React, { useState, useEffect, useRef } from "react";

const WS_URL = `ws://${window.location.hostname}:8080`;

const Chat: React.FC = () => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [hasUsername, setHasUsername] = useState(false);
  const [room, setRoom] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(false);

  useEffect(() => {
    if (!joinedRoom || ws.current) return;

    console.log("🔄 Connecting to WebSocket...");
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("✅ Connected to WebSocket!");
      setIsConnected(true);
      ws.current?.send(JSON.stringify({ type: "join", room }));
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
  }, [joinedRoom]);

  const sendMessage = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.log("⚠️ WebSocket not connected.");
      return;
    }

    if (input.trim() !== "" && username.trim() !== "") {
      const message = { type: "message", sender: username, text: input };
      console.log("🚀 Sending Message:", message);
      ws.current.send(JSON.stringify(message));
      setInput("");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {!hasUsername ? (
          <div style={styles.inputContainer}>
            <h2 style={styles.title}>Enter Your Name</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              style={styles.input}
            />
            <button
              onClick={() => setHasUsername(true)}
              disabled={username.trim() === ""}
              style={{ ...styles.button, background: username ? "#ff0080" : "#660066" }}
            >
              Set Name
            </button>
          </div>
        ) : !joinedRoom ? (
          <div style={styles.inputContainer}>
            <h2 style={styles.title}>Enter Room Name</h2>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room name"
              style={styles.input}
            />
            <button
              onClick={() => setJoinedRoom(true)}
              disabled={room.trim() === ""}
              style={{ ...styles.button, background: room ? "#ff0080" : "#660066" }}
            >
              Join Room
            </button>
          </div>
        ) : (
          <>
            <h3 style={styles.title}>
              Welcome, {username}! (Room: {room})
            </h3>
            <div style={styles.messagesContainer}>
            {messages.map((msg, index) => {
    const isSender = msg.sender === username;
    return (
      <div
        key={index}
        style={{
          background: isSender ? "#ff0080" : "#4d004d", // Different colors for sender & receiver
          color: "white",
          padding: "10px",
          borderRadius: "10px",
          marginBottom: "8px",
          maxWidth: "75%",
          alignSelf: isSender ? "flex-end" : "flex-start",
          textAlign: "left",
          wordWrap: "break-word",
          display: "inline-block", // Ensures proper message box formatting
          fontWeight: "bold",
        }}
      >
        {msg.sender}: <span style={{ fontWeight: "normal" }}>{msg.text}</span>
      </div>
    );
  })}
            </div>
            <div style={styles.inputSection}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                style={styles.chatInput}
              />
              <button onClick={sendMessage} style={styles.sendButton} disabled={!isConnected}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Styling
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#2c003e",
    padding: "20px",
  },
  chatBox: {
    width: "100%",
    maxWidth: "450px",
    background: "#3b003b",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
  },
  inputContainer: {
    textAlign: "center",
    width: "100%",
  },
  title: {
    color: "#ffccff",
    marginBottom: "15px",
  },
  input: {
    width: "90%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ff80ff",
    fontSize: "16px",
    background: "#4d004d",
    color: "white",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  messagesContainer: {
    height: "300px",
    overflowY: "auto",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    borderRadius: "5px",
    background: "#25002b",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
    color: "white",
    display: "flex",
    flexDirection: "column",
  },
  sender: {
    fontSize: "12px",
    fontWeight: "bold",
    opacity: 0.8,
  },
  messageText: {
    fontSize: "14px",
    marginTop: "5px",
  },
  inputSection: {
    display: "flex",
    width: "100%",
    marginTop: "10px",
  },
  chatInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ff80ff",
    fontSize: "16px",
    background: "#4d004d",
    color: "white",
    marginRight: "10px",
  },
  sendButton: {
    padding: "10px 15px",
    borderRadius: "5px",
    border: "none",
    background: "#ff0080",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Chat;
