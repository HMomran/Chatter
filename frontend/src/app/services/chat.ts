import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Session } from './session';
export interface Chat { _id: string; name: string; phone: string; }
export interface AuthResult { customer: Chat; token: string; }
@Injectable({ providedIn: 'root' })
export class ChatService {
  private api = 'http://localhost:3000/api/customers';
  private session = inject(Session);
  constructor(private http: HttpClient) {}
  get() { return this.http.get<Chat[]>(this.api, { headers: this.session.headers }); }
  getById(id: string) { return this.http.get<Chat>(`${this.api}/${id}`, { headers: this.session.headers }); }
  post(client: { name: string; phone: string; password: string }) { return this.http.post<AuthResult>(this.api, client); }
  login(phone: string, password: string) { return this.http.post<AuthResult>(`${this.api}/login`, { phone, password }); }
  logout() { return this.http.post(`${this.api}/logout`, {}, { headers: this.session.headers }); }
}
