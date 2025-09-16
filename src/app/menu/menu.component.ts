import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService } from '../services/cart.service';
import { SignalrService } from '../services/signalr.service';
import { environment } from '../../environments/environments';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  menuItems: any[] = [];
  searchTerm = '';
  selectedCategory = '';
  showFavouritesOnly = false;
  favourites: Set<number> = new Set();
  private menuApi = `${environment.apiUrl}/menu`;
  availableCategories: string[] = [];

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private signalr: SignalrService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const category = params['category'];
      this.selectedCategory = category || '';
      console.log('Selected category from URL:', this.selectedCategory);
      this.fetchMenu();
    });

    if (localStorage.getItem('token')) {
      this.signalr.startConnection();
    }
    
    const favs = localStorage.getItem('favourites');
    if (favs) {
      this.favourites = new Set(JSON.parse(favs));
    }
  }

  fetchMenu() {
    this.http.get<any[]>(this.menuApi).subscribe({
      next: res => {
        this.menuItems = res;
        console.log('Menu items loaded:', this.menuItems);
        console.log('Available categories:', this.menuItems.map(item => item.categoryName));
        this.extractCategories();
      },
      error: err => {
        console.error('Error fetching menu:', err);
        this.snackBar.open('❌ Failed to load menu items', 'Close', { duration: 3000 });
      }
    });
  }

  extractCategories() {
    const categories = new Set<string>();
    this.menuItems.forEach(item => {
      if (item.categoryName) {
        categories.add(item.categoryName);
      }
    });
    this.availableCategories = Array.from(categories).sort();
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.router.navigate(['/menu'], { queryParams: { category } });
  }

  clearCategoryFilter() {
    this.selectedCategory = '';
    this.router.navigate(['/menu']);
  }

  addToCart(item: any) {
    this.cartService.addToCart(item.id).subscribe({
      next: () => {
        this.snackBar.open(`✅ Added ${item.name} to cart`, 'Close', { 
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: () => {
        this.snackBar.open('❌ Failed to add item to cart', 'Close', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  get filteredMenu() {
    return this.menuItems.filter(item => {
      // ✅ Category filter with normalization
      const matchesCategory =
        !this.selectedCategory ||
        this.normalizeCategoryName(item.categoryName) === this.normalizeCategoryName(this.selectedCategory);

      const matchesSearch =
        !this.searchTerm ||
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesFavourite =
        !this.showFavouritesOnly || this.favourites.has(item.id);

      return matchesCategory && matchesSearch && matchesFavourite;
    });
  }

  // ✅ Helper method to normalize category names
  private normalizeCategoryName(categoryName: string): string {
    const normalized = categoryName.toLowerCase().trim();

    const categoryMappings: { [key: string]: string } = {
      'beverage': 'beverage',
      'beverages': 'beverage',
      'drinks': 'beverage',
      'drink': 'beverage',
      'starter': 'starter',
      'starters': 'starter',
      'appetizer': 'starter',
      'appetizers': 'starter',
      'main course': 'maincourse',
      'maincourse': 'maincourse',
      'main': 'maincourse',
      'entree': 'maincourse',
      'entrees': 'maincourse',
      'snack': 'snack',
      'snacks': 'snack',
      'dessert': 'dessert',
      'desserts': 'dessert',
      'sweet': 'dessert'
    };

    return categoryMappings[normalized] || normalized;
  }

  toggleFavourite(item: any) {
    if (this.favourites.has(item.id)) {
      this.favourites.delete(item.id);
      this.snackBar.open(`💔 Removed ${item.name} from favourites`, 'Close', { duration: 1500 });
    } else {
      this.favourites.add(item.id);
      this.snackBar.open(`❤️ Added ${item.name} to favourites`, 'Close', { duration: 1500 });
    }

    localStorage.setItem('favourites', JSON.stringify([...this.favourites]));
  }

  clearFilters() {
    this.searchTerm = '';
    this.showFavouritesOnly = false;
    this.selectedCategory = '';
    this.router.navigate(['/menu']);
  }

  // ✅ Back to home
  goHome() {
    this.router.navigate(['/']);
  }
}
