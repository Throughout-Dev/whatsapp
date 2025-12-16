import { io } from 'socket.io-client';

// Your backend URL for the WebSocket connection
const URL = 'https://wp-api.gapalyze.com'; 
export const socket = io(URL);
