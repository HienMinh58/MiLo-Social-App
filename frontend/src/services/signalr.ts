import * as signalR from "@microsoft/signalr";
import { API_URL } from "../config/api";


let connection: signalR.HubConnection | null = null;

export async function initSignalR(
    accessToken: string,
    onReceiveMessage: (
        senderId: string,
        content: string,
        sentAt: string,
        senderAvatarUrl: string
    ) => void 
) {
    if(!connection) {
        connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:8080/hub/chat", { accessTokenFactory: () => accessToken })
            .withAutomaticReconnect()
            .build();

        connection.on("ReceiveMessage", onReceiveMessage);
        
        try{
            await connection.start();
            console.log("SignalR Connected");
        } catch(err) {
            console.error("SignalR connection error", err);
        }

        return;
    }

    if(connection.state === signalR.HubConnectionState.Connected){
        connection.off("ReceiveMessage");
        connection.on("ReceiveMessage", onReceiveMessage);
    } else {
        connection.off("ReceiveMessage");
        connection.on("ReceiveMessage", onReceiveMessage);
    }
}

export function getConnection() {
  return connection;
}

export async function disconnectSignalR() {
  if (connection) {
    try {
      await connection.stop();
      connection = null;
    } catch (err) {
      console.error("Error disconnecting SignalR:", err);
    }
  }
}