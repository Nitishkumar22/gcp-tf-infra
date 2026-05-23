const socketIo = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: true, // Allow all origins in development
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    
    // Setup user's socket
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
      console.log(`User Connected: ${userData._id}`);
    });

    // Join a chat room
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    // Handle typing status
    socket.on("typing", (room) => {
      socket.in(room).emit("typing", room);
    });
    
    socket.on("stop typing", (room) => {
      socket.in(room).emit("stop typing", room);
    });

    // Handle new message
    socket.on("new message", (newMessageReceived) => {
      let chat = newMessageReceived.chat;
      
      if (!chat.users) return;
      
      chat.users.forEach((user) => {
        if (user._id === newMessageReceived.sender._id) return;
        
        socket.in(user._id).emit("message received", newMessageReceived);
      });
    });

    // Handle user online status
    socket.on("user online", (userId) => {
      socket.broadcast.emit("user status", { userId, status: "online" });
    });

    socket.on("user offline", (userId) => {
      socket.broadcast.emit("user status", { userId, status: "offline" });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initializeSocket, getIO };
