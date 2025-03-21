import React from "react";
import Chat from "./chat";

const App: React.FC = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>💬 P2P WebSocket Chat</h1>
      <Chat />
    </div>
  );
};

export default App;
