import { Session } from './session';
import { Injectable, inject } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
export interface Message { _id: string; sender: string; receiver: string; message: string; timestamp: string; }
@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket = io('http://localhost:3000', { autoConnect: false });
  private userId = '';
  private session = inject(Session);
  constructor() { this.socket.on('connect', () => this.socket.emit('join', this.userId)); }
  join(userId: string) {
    this.userId = userId;
    if (this.socket.connected) this.socket.emit('join', userId);
    else { this.socket.auth = { token: this.session.token }; this.socket.connect(); }
  }
  sendMessage(msg: { receiver: string; message: string }, done: (error?: string) => void) {
    this.socket.timeout(5000).emit('sendMessage', msg, (error: Error | null, result: { error?: string }) => done(error ? 'Connection lost. Please try again.' : result?.error));
  }
  receiveMessages(): Observable<Message> {
    return new Observable(observer => {
      const listener = (msg: Message) => observer.next(msg);
      this.socket.on('receiveMessage', listener);
      return () => { this.socket.off('receiveMessage', listener); this.socket.disconnect(); };
    });
  }
}
