import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../services/chat';
import { Session } from '../../services/session';
@Component({
  selector: 'app-customer-sign-up', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customer-sign-up.html', styleUrl: './customer-sign-up.css'
})
export class CustomerSignUp {
  private api = inject(ChatService);
  private session = inject(Session);
  private router = inject(Router);
  error = ''; busy = false; showPassword = false; submitted = false;
  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\+?[\d\s()-]{7,25}$/)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128)] }),
    confirmPassword: new FormControl('', Validators.required),
  });
  onSubmit() {
    this.submitted = true; this.form.markAllAsTouched(); this.error = '';
    if (this.form.invalid || this.busy) return;
    if (this.form.value.password !== this.form.value.confirmPassword) { this.error = 'Your passwords do not match.'; return; }
    this.busy = true;
    this.api.post({ name: this.form.controls.name.value, phone: this.form.controls.phone.value, password: this.form.controls.password.value }).subscribe({
      next: result => { this.session.save(result); this.router.navigate(['/UsersPage']); },
      error: error => { this.busy = false; this.error = error.error?.message || 'Cannot connect. Please check your connection and try again.'; }
    });
  }
}
