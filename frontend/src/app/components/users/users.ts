import { Component, OnInit, inject } from '@angular/core';
import { ChatService } from '../../services/chat';
import { Chat } from '../../services/chat';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit {
  private router = inject(Router);
  private userService = inject(ChatService);
  users!: Chat[];

  ngOnInit(): void {
    this.initData();
  }

  initData(): void {
    this.userService.get().subscribe(
      data => {
        this.users = data;
        console.log('Users loaded:', data);
      },
      error => {
        console.error('Error loading users:', error);
      }
    );
  }

    selectUser(user: Chat) {
    this.router.navigate(['/ChatPage'], {
      queryParams: { receiverId: user._id, receiverName: user.name }
    });
}
}
