import { Component, inject } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatLabel } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../services/chat';

@Component({
  selector: 'app-customer-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormField, MatInput, MatLabel, RouterModule],
  templateUrl: './customer-sign-up.html',
  styleUrl: './customer-sign-up.css'
})
export class CustomerSignUp {
  form!: FormGroup;
 [x: string]: any;
 private chatService = inject(ChatService);
 router = inject(Router);

 ngOnInit(): void {
  this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
  })
 }

 onSubmit() {
  if (this.form.valid) {
    const phone = this.form.value.phone;
    this.chatService.checkPhone(phone).subscribe(
      (result: { exists: boolean }) => {
        if (result.exists) {
          alert('Phone number already exists!');
          this.router.navigate(['/SignIn']);
        } else {
          this.chatService.post(this.form.value).subscribe(
            data => {
              console.log('saved');
              this.router.navigate(['/SignIn']);
            },
            error => {
              console.error('Error saving customer:', error);
            }
          );
        }
      },
      error => {
        console.error('Error checking phone:', error);
      }
    );
  }
}
}
