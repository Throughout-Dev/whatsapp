import { io } from 'socket.io-client';

// Your backend URL for the WebSocket connection
const URL = 'http://localhost:3000'; 
export const socket = io(URL);
