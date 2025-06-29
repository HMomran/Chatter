import { Component } from '@angular/core';
import { ChatService } from '../../services/socket-chat';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [FormsModule,CommonModule,MatIconModule,RouterModule],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.css'
})
export class ChatPage {
  private route = inject(ActivatedRoute);
  messages: any[] = [];
  messageText: string = '';
  currentUserId = 'user1';
  receiverId = 'user2';
  receiverName: string = '';


  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.join(this.currentUserId);

    this.chatService.receiveMessages().subscribe((msg) => {
      this.messages.push(msg);
    });

    this.route.queryParams.subscribe(params => {
      this.receiverId = params['receiverId'];
      this.receiverName = params['receiverName'];
    });
  }

  switchUser() {
  this.currentUserId = this.currentUserId === 'user1' ? 'user2' : 'user1';
  this.receiverId = this.currentUserId === 'user1' ? 'user2' : 'user1';
  this.chatService.join(this.currentUserId);
}

sendMessage() {
  if (!this.messageText.trim()) return;

  const msg = {
    sender: this.currentUserId,
    receiver: this.receiverId,
    message: this.messageText.trim()
  };

  this.chatService.sendMessage(msg); // Send only
  this.messageText = '';  
}

}

