import { Session } from '../../services/session';
import { Component, OnInit, inject } from '@angular/core';
import { ChatService, Chat } from '../../services/chat';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({ selector: 'app-users', host: { class: 'directory-page' }, standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './users.html', styleUrls: ['./users.css'] })
export class Users implements OnInit {
  private router = inject(Router);
  private api = inject(ChatService);
  private session = inject(Session);
  currentUser = this.session.user;
  users: Chat[] = [];
  search = ''; error = ''; loading = false; signingOut = false;
  refreshed = false;
  get statusText() {
    if (this.loading) return 'Updating your directory…';
    if (this.error) return 'Directory unavailable';
    const count = this.filteredUsers.length;
    if (this.search.trim()) return `${count} ${count === 1 ? 'person matches' : 'people match'} your search`;
    return `${count} ${count === 1 ? 'person' : 'people'} to connect with${this.refreshed ? ' · Directory up to date' : ''}`;
  }
  trackUser(_index: number, user: Chat) { return user._id; }
  get filteredUsers() { const q = this.search.trim().toLowerCase(); return this.users.filter(u => u.name.toLowerCase().includes(q) || u.phone.includes(q)); }
  initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('').toUpperCase(); }
  ngOnInit() {
    if (!this.currentUser || !this.session.token) { this.router.navigate(['/SignIn']); return; }
    this.initData();
  }
  initData() {
    if (this.loading) return;
    this.loading = true; this.error = '';
    this.api.get().subscribe({
      next: data => { this.users = data.filter(u => u._id !== this.currentUser?._id).sort((a,b) => a.name.localeCompare(b.name)); this.loading = false; this.refreshed = true; },
      error: error => { this.loading = false; if (error.status === 401) { this.session.user = null; this.router.navigate(['/SignIn']); } else this.error = 'Could not load people. Please try again.'; }
    });
  }
  selectUser(user: Chat) { this.router.navigate(['/ChatPage'], { queryParams: { receiverId: user._id, receiverName: user.name } }); }
  logout() { if (this.signingOut) return; this.signingOut = true; this.api.logout().subscribe({ next: () => this.leave(), error: () => this.leave() }); }
  private leave() { this.session.user = null; this.router.navigate(['/SignIn']); }
}
