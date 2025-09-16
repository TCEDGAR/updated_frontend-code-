import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  loginForm: FormGroup;
  private apiUrl = 'http://localhost:5030/api/auth/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) return;

    this.http.post<any>(this.apiUrl, this.loginForm.value).subscribe({
      next: (res) => {
        // Save token + username (from form)
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', this.loginForm.value.username);

        this.snackBar.open(`✅ Welcome, ${this.loginForm.value.username}!`, 'Close', {
          duration: 3000
        });

        this.router.navigate(['/menu']);
      },
      error: (err) => {
        this.snackBar.open(
          '❌ Login failed: ' + (err.error?.title || err.message),
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
