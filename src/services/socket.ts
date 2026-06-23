import { io, Socket } from 'socket.io-client';
import { storage } from '../utils/storage';

const SOCKET_URL = 'http://192.168.1.2:3000/tracking';

class SocketService {
  public socket: Socket | null = null;

  async connectAsUser() {
    if (this.socket) this.disconnect();

    const token = await storage.get<string>('AUTH_TOKEN');
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket as user');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket');
    });
  }

  async connectAsDriver(driverId: string) {
    if (this.socket) this.disconnect();

    const token = await storage.get<string>('AUTH_TOKEN');
    
    this.socket = io(SOCKET_URL, {
      query: { driverId },
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket as driver');
    });
  }

  emitLocationUpdate(lat: number, lng: number) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('update_location', { lat, lng });
    }
  }

  on(eventName: string, callback: (data: any) => void) {
    this.socket?.on(eventName, callback);
  }

  off(eventName: string, callback?: (data: any) => void) {
    this.socket?.off(eventName, callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
