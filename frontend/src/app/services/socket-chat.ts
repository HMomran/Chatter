import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket = io('http://localhost:3000');

  join(userId: string) {
    this.socket.emit('join', userId);
  }

  sendMessage(msg: any) {
    this.socket.emit('sendMessage', msg);
  }

  receiveMessages(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receiveMessage', (msg) => {
        observer.next(msg);
      });
    });
  }
}
