import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../services/chat';
import { Session } from '../../services/session';
@Component({
  selector: 'app-customer-sign-in', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customer-sign-in.html', styleUrl: './customer-sign-in.css'
})
export class CustomerSignIn {
  private api = inject(ChatService);
  private session = inject(Session);
  private router = inject(Router);
  error = ''; busy = false; showPassword = false; submitted = false;
  form = new FormGroup({

    phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\+?[\d\s()-]{7,25}$/)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128)] }),

  });
  onSubmit() {
    this.submitted = true; this.form.markAllAsTouched(); this.error = '';
    if (this.form.invalid || this.busy) return;

    this.busy = true;
    this.api.login(this.form.value.phone!, this.form.value.password!).subscribe({
      next: result => { this.session.save(result); this.router.navigate(['/UsersPage']); },
      error: error => { this.busy = false; this.error = error.error?.message || 'Cannot connect. Please check your connection and try again.'; }
    });
  }
}
