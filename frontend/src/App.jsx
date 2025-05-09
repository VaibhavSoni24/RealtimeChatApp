import React, { useEffect, useRef } from 'react';
import io from "socket.io-client";
import './App.css';
import { FiSend, FiMessageCircle } from 'react-icons/fi';

const socket = io("http://localhost:3001");

export default function App() {
  const [username, setUsername] = React.useState("");
  const [entered, setEntered] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const messagesContainerRef = useRef(null);

  const sendMessage = () => {
    if (message !== "") {
      const messageData = {
        sender: username,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      socket.emit("send_message", messageData);
      setMessages((prev) => [...prev, messageData]);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
 
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleJoinChat = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (username.trim()) {
        setEntered(true);
      }
    }
  };

  const getInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  if (!entered) {
    return (
      <div className="login-container">
        <h2 className="login-title">Welcome to SkyySkill Chat</h2>
        <input 
          className="login-input"
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleJoinChat}
          placeholder="Enter your name"
          autoFocus
        />
        <button 
          className="login-button"
          onClick={handleJoinChat}
        >
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <FiMessageCircle size={20} style={{ marginRight: '8px' }} />
          SkyySkill Chat Room
        </div>
        <div className="user-info">
          <div className="avatar">
            {getInitial(username)}
          </div>
          <span>{username}</span>
        </div>
      </div>

      <div 
        className="messages-container"
        ref={messagesContainerRef}
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`message-row ${msg.sender === username ? 'message-own' : 'message-other'}`}
          >
            <div className="message-bubble">
              <div className="message-sender">{msg.sender}</div>
              <div className="message-text">{msg.text}</div>
              <div className="message-time">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="input-container">
        <input 
          className="message-input"
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          autoFocus
        />
        <button 
          className="send-button"
          onClick={sendMessage}
        >
          <FiSend size={18} />
        </button>
      </div>
    </div>
  );
}