import { Component, inject, DestroyRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatService, Message } from '../../services/socket-chat';
import { Session } from '../../services/session';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-chat-page', standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './chat-page.html', styleUrl: './chat-page.css'
})
export class ChatPage implements AfterViewChecked {
  @ViewChild("timeline") timeline?: ElementRef<HTMLElement>;
  private scrollPending = true;
  loading = true;
  ngAfterViewChecked() { if (this.scrollPending && this.timeline) { this.timeline.nativeElement.scrollTop = this.timeline.nativeElement.scrollHeight; this.scrollPending = false; } }
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private session = inject(Session);
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private chatService = inject(ChatService);
  messages: Message[] = [];
  messageText = '';
  currentUserId = '';
  currentUserName = '';
  receiverId = '';
  receiverName = '';
  error = '';
  sending = false;
  ngOnInit() {
    const user = this.session.user;
    if (!user || !this.session.token) { this.router.navigate(['/SignIn']); return; }
    this.currentUserId = user._id;
    this.currentUserName = user.name;
    this.receiverId = this.route.snapshot.queryParamMap.get('receiverId') || '';
    this.receiverName = this.route.snapshot.queryParamMap.get('receiverName') || '';
    if (!this.receiverId) { this.router.navigate(['/UsersPage']); return; }
    this.chatService.receiveMessages().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(msg => {
      if ((msg.sender === user._id && msg.receiver === this.receiverId) || (msg.sender === this.receiverId && msg.receiver === user._id)) this.merge([msg]);
    });
    this.chatService.join(user._id);
    this.http.get<Message[]>(`http://localhost:3000/api/messages/customers/${user._id}?peer=${encodeURIComponent(this.receiverId)}`, { headers: this.session.headers })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: msgs => { this.loading = false; this.merge(msgs); }, error: error => { this.loading = false; if (error.status === 401) { this.session.user = null; this.router.navigate(['/SignIn']); } else this.error = 'Could not load message history.'; } });
  }
  private merge(msgs: Message[]) {
    this.scrollPending = true;
    this.messages = [...new Map([...this.messages, ...msgs].map(m => [m._id, m])).values()].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  sendMessage() {
    if (!this.messageText.trim() || this.sending) return;
    this.sending = true;
    this.error = '';
    this.chatService.sendMessage({ receiver: this.receiverId, message: this.messageText.trim() }, error => {
      this.sending = false;
      if (error) this.error = error;
      else this.messageText = '';
    });
  }
}
