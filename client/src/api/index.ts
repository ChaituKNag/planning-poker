import { Socket, io as socketIO } from "socket.io-client"

let io: Socket;

export const setupApi = () => {
    if(!io) {
        io = socketIO(process.env.REACT_APP_SERVER_URL || "http://localhost:4000");
    }
}

export const getIo = () => {
    if(!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
}