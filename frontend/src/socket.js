// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // Replace with backend URL if hosted

export default socket;
