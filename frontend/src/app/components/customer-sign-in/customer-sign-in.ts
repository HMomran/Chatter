import { Component, inject } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatLabel } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../services/chat';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-customer-sign-in',
    imports: [ReactiveFormsModule, MatFormField, MatInput, MatLabel, RouterModule,CommonModule,
    MatIconModule],
  templateUrl: './customer-sign-in.html',
  styleUrl: './customer-sign-in.css'
})
export class CustomerSignIn {
  form!: FormGroup;
  [x: string]: any;
  private chatService = inject(ChatService);
  router = inject(Router);

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const name = this.form.value.name;
      const phone = this.form.value.phone;
      this.chatService.checkCustomer(name, phone).subscribe(
        result => {
          if (result.exists) {
            this.router.navigate(['/UsersPage']);
          } else {
            this.router.navigate(['/SignUp']);
          }
        },
        error => {
          console.error('Error checking customer:', error);
        }
      );
    }
  }
}

