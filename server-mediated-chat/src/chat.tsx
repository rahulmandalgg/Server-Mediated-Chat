import React, { useState, useEffect, useRef } from "react";

const WS_URL = `ws://${window.location.hostname}:8080`;

const Chat: React.FC = () => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string; timestamp: string }[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [hasUsername, setHasUsername] = useState(false);
  const [room, setRoom] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [activeRooms, setActiveRooms] = useState<{ room: string; clients: number }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // useEffect(() => {
  //   if (ws.current) return; // Prevent multiple connections
  
  //   console.log("🔄 Connecting to WebSocket...");
  //   ws.current = new WebSocket(WS_URL);
  
  //   ws.current.onopen = () => {
  //     console.log("✅ Connected to WebSocket!");
  //     setIsConnected(true);
  //   };
  
  //   ws.current.onmessage = (event) => {
  //     try {
  //       const message = JSON.parse(event.data);
  //       console.log("📩 New message:", message);
  
  //       if (message.type === "list") {
  //         console.log("Received active rooms:", message.rooms);
  //         setActiveRooms(message.rooms);
  //       } else if (message.sender && message.text) {
  //         setMessages((prev) => [...prev, message]);
  //       }
  //     } catch (error) {
  //       console.error("❌ Error parsing message:", error);
  //     }
  //   };
  
  //   ws.current.onerror = (err) => console.error("❌ WebSocket Error:", err);
  //   ws.current.onclose = () => {
  //     console.log("❌ WebSocket Disconnected!");
  //     setIsConnected(false);
  //   };
  
  //   return () => {
  //     ws.current?.close();
  //     ws.current = null;
  //   };
  // }, []);


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

        if (message.type === "list") {
          console.log("Received active rooms:", message.rooms);
          setActiveRooms(message.rooms);
        } else if (message.sender && message.text) {
          setMessages((prev) => [...prev, message]);
        }
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    console.log("Active Rooms:", activeRooms);
  }, [activeRooms]);

  // const joinRoom = () => {
  //   if (ws.current && ws.current.readyState === WebSocket.OPEN) {
  //     ws.current.send(JSON.stringify({ type: "join", room }));
  //     setJoinedRoom(true);
  //     console.log(`🚪 Joined room: ${room}`);
  //   } else {
  //     console.log("⚠️ WebSocket is not open. Cannot join room.");
  //   }
  // };

  const fetchActiveRooms = async () => {
    try {
      console.log("Fetching active rooms...");
      const response = await fetch(`http://${window.location.hostname}:8081/active-rooms`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const rooms = await response.json();
        console.log("Received active rooms:", rooms);
        setActiveRooms(rooms);
      } else {
        console.error("Failed to fetch active rooms:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching active rooms:", error);
    }
  };

//   const fetchActiveRooms = () => {
//   if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//     console.log("Fetching active rooms...");
//     ws.current.send(JSON.stringify({ type: "list" }));
//   } else {
//     console.log("⚠️ WebSocket is not open. Cannot fetch active rooms.");
//   }
// };

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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
              onKeyDown={(e) => e.key === "Enter" && username.trim() !== "" && setHasUsername(true)}
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
              onKeyDown={(e) => e.key === "Enter" && room.trim() !== "" && setJoinedRoom(true)}
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
            <button onClick={fetchActiveRooms} style={{ ...styles.button, marginTop: "10px" }}>
            Show Active Rooms
          </button>
          <div style={styles.activeRooms}>
            {activeRooms.length > 0 ? (
              activeRooms.map((r, index) => (
                <div key={index} style={styles.roomItem}>
                  {r.room} ({r.clients} clients)
                </div>
              ))
            ) : (
              <div>No active rooms available.</div>
            )}
          </div>
          </div>
        ) : (
          <>
            <h3 style={styles.title}>
              Welcome, {username}! (Room: {room})
            </h3>
            <div style={styles.messagesContainer}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.messageBubble,
                    alignSelf: msg.sender === username ? "flex-end" : "flex-start", // Align sent messages to the right
                    background: msg.sender === username ? "#ff0080" : "#4d004d", // Different background colors
                  }}
                >
                  <div style={styles.messageHeader}>
                  <span style={styles.sender}>{msg.sender}:</span>
                  <span style={styles.messageText}>{msg.text}</span>
                  <span></span>
                  <div style={styles.timestamp}>{formatTime(msg.timestamp)}</div>
                </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={styles.inputSection}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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

// Add styles for active rooms
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
    maxWidth: "600px",
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
    height: "400px",
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
    wordBreak: "break-word", // Ensure long messages wrap properly
  },
  sender: {
    fontSize: "14px",
    fontWeight: "bold",
    opacity: 0.9,
  },
  messageText: {
    fontSize: "14px",
    marginTop: "0", // Remove extra spacing
  },
  timestamp: {
    fontSize: "12px",
    color: "#cccccc", // Lighter color for the timestamp
    marginTop: "5px",
    alignSelf: "flex-end", // Align timestamp to the right
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
  activeRooms: {
    marginTop: "20px",
    padding: "10px",
    background: "#4d004d",
    borderRadius: "5px",
    color: "white",
  },
  roomItem: {
    marginBottom: "5px",
  },
  messageHeader: {
    display: "flex",
    alignItems: "center",
    gap: "5px", // Add spacing between the name and message
  },
};

export default Chat;
