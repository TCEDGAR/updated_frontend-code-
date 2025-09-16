import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  constructor(private router: Router) {}

  // ✅ Categories for Elegant UI
  categories = [
    {
      id: 'Beverage',
      name: 'Beverage',
      imageUrl: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg'
    },
    {
      id: 'Starter',
      name: 'Starter',
      imageUrl: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg'
    },
    {
      id: 'MainCourse',
      name: 'Main Course',
      imageUrl: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg'
    },
    {
      id: 'Snack',
      name: 'Snack',
      imageUrl: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg'
    }
  ];

  // ✅ Navigate to menu with or without category filter
  goToMenu(category?: string) {
    if (category) {
      this.router.navigate(['/menu'], { queryParams: { category } });
    } else {
      this.router.navigate(['/menu']);
    }
  }
}
