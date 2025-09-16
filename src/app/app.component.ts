import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private router: Router) {}

  // Check if user is logged in
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Get username from localStorage (set during login)
  get userName(): string | null {
    return localStorage.getItem('username');
  }

  goToMenu() {
    this.router.navigate(['/menu']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username'); // clear username on logout
    this.router.navigate(['/']); // Navigate to home after logout
  }
}
