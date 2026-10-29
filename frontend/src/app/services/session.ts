import { Injectable } from '@angular/core';
import { Chat, AuthResult } from './chat';
@Injectable({ providedIn: 'root' })
export class Session {
  get user(): Chat | null {
    try { return JSON.parse(sessionStorage.getItem('chat-user') || 'null'); } catch { return null; }
  }
  set user(user: Chat | null) {
    if (user) sessionStorage.setItem('chat-user', JSON.stringify(user));
    else { sessionStorage.removeItem('chat-user'); sessionStorage.removeItem('chat-token'); }
  }
  get token(): string { return sessionStorage.getItem('chat-token') || ''; }
  save(result: AuthResult) { this.user = result.customer; sessionStorage.setItem('chat-token', result.token); }
  get headers() { return { Authorization: `Bearer ${this.token}` }; }
}
