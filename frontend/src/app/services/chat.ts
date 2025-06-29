import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Chat {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private api = "http://localhost:3000/api/customers"

  constructor(private http: HttpClient) {}

  get(): Observable<Chat[]> {
    return this.http.get<Chat[]>(this.api);
  }

  getById(id: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.api}/${id}`);
  }

  post(client: Chat): Observable<Chat> {
    return this.http.post<Chat>(this.api, client);
  }

  checkCustomer(name: string, phone: string) {
  return this.http.get<{ exists: boolean }>(`${this.api}/check-customer/${name}/${phone}`);
 }

 checkPhone(phone: string) {
  return this.http.get<{ exists: boolean }>(`${this.api}/check-phone/${phone}`);
}
}