import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CartService } from '../services/cart.service';
import { environment } from '../../environments/environments';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  menuItems: any[] = [];
  favourites: Set<number> = new Set();
  searchTerm: string = '';
  showFavouritesOnly: boolean = false;
  cartItemCount: number = 0;

  private imageMap: { [key: string]: string } = {
    'Cold Coffee': 'assets/images/cold-coffee.jpg',
    'Lemon Iced Tea': 'assets/images/lemon-iced-tea.jpg',
    'Garlic Bread': 'assets/images/garlic-bread.jpg',
    'Chicken Wings': 'assets/images/chicken.jpg',
    'Margherita Pizza': 'assets/images/margherita-pizza.jpg',
    'Veggie Supreme Pizza': 'assets/images/veggie-supreme-pizza.jpg',
    'French Fries': 'assets/images/french-fries.jpg',
    'Veg Sandwich': 'assets/images/veg-sandwich.jpg',
    'Nachos': 'assets/images/nachos.jpg',
    'Paneer Burger': 'assets/images/paneer-burger.jpg',
    'White Sauce Pasta': 'assets/images/white-sauce-pasta.jpg',
    'Beverage': 'assets/images/beverages.jpg',
    'Starter': 'assets/images/starters.jpg',
    'MainCourse': 'assets/images/maincourses.jpg',
    'Snack': 'assets/images/snacks.jpg'
  };

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private cartService: CartService) {}

  ngOnInit(): void {
    this.loadMenu();
    this.refreshCartCount();
  }

  /** Load menu items from backend and map images + fix veg/non-veg */
  loadMenu(): void {
    const apiUrl = `${environment.apiUrl}/menu`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: data => {
        this.menuItems = data.map(item => ({
          ...item,
          // Coerce veg to boolean (fixes Lemon Iced Tea showing non-veg)
          veg: item.veg === true || item.veg === 'true',
          imageUrl: item.imageUrl || this.imageMap[item.name] || this.imageMap[item.categoryName] || 'assets/images/default-food.jpg'
        }));
      },
      error: err => {
        console.error('Error loading menu:', err);
        this.snackBar.open('❌ Failed to load menu', 'Close', { duration: 3000 });
      }
    });
  }

  /** Add item to backend cart */
  addToCart(item: any): void {
    this.cartService.addToCart(item.id).subscribe({
      next: () => {
        this.snackBar.open(`${item.name} added to cart 🛒`, 'Close', { duration: 2000 });
        this.refreshCartCount();
      },
      error: err => {
        console.error('Add to cart failed:', err);
        this.snackBar.open('❌ Failed to add to cart', 'Close', { duration: 2000 });
      }
    });
  }

  /** Toggle favourite locally */
  toggleFavourite(itemId: number): void {
    if (this.favourites.has(itemId)) {
      this.favourites.delete(itemId);
      this.snackBar.open('Removed from favourites ❤️‍🩹', 'Close', { duration: 1500 });
    } else {
      this.favourites.add(itemId);
      this.snackBar.open('Added to favourites ❤️', 'Close', { duration: 1500 });
    }
  }

  /** Filtered menu based on search and favourites */
  get filteredMenu(): any[] {
    return this.menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesFav = !this.showFavouritesOnly || this.favourites.has(item.id);
      return matchesSearch && matchesFav;
    });
  }

  /** Refresh live cart count from backend */
  refreshCartCount(): void {
    this.cartService.getCart().subscribe({
      next: cartData => this.cartItemCount = cartData?.length || 0,
      error: err => console.error('Failed to fetch cart count', err)
    });
  }
}
