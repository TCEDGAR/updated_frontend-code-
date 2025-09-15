import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ You must log in first!');
      this.router.navigate(['/user-login']); // default redirect
      return false;
    }
    return true;
  }
}
