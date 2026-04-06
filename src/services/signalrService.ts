import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../stores/authStore';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5235/api').replace(/\/api\/?$/, '');

  public async connect(): Promise<void> {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.backendUrl}/hubs/tablestatus`, {
        accessTokenFactory: () => useAuthStore.getState().token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    try {
      await this.connection.start();
      console.log('SignalR Connected');
    } catch (err) {
      this.connection = null;
      console.log('Error connecting SignalR', err);
    }
  }

  public on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.connection) return;
    this.connection.on(eventName, callback);
  }

  public off(eventName: string, callback: (...args: any[]) => void) {
    if (!this.connection) return;
    this.connection.off(eventName, callback);
  }

  public async invoke(methodName: string, ...args: any[]) {
    if (!this.connection) return;
    return await this.connection.invoke(methodName, ...args);
  }
  
  public disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();
