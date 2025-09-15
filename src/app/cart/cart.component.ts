import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { CartService } from '../services/cart.service';
import { OrdersService } from '../services/orders.service';
import { SignalrService } from '../services/signalr.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: any = { items: [] };
  private subs: Subscription[] = [];

  constructor(
    private router: Router,
    private cartService: CartService,
    private ordersService: OrdersService,
    private signalr: SignalrService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCart();

    if (localStorage.getItem('token')) {
      this.signalr.startConnection(() => {
        this.signalr.on('CartUpdated', (payload) => {
          this.cart = this.normalizeCartItems(payload);
        });
        this.signalr.on('OrderPlaced', (payload) => {
          this.snackBar.open(
            `✅ Order placed! Total: ₹${payload.total ?? payload.Total}`,
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        });
      });
    }
  }

  /** Total amount of cart items */
  get totalAmount(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce((sum: number, item: any) => {
      const price = item.menuItem?.price || item.MenuItem?.Price || 0;
      const qty = item.quantity || item.Quantity || 0;
      return sum + price * qty;
    }, 0);
  }

  /** Final total including tax and delivery */
  get finalTotal(): number {
    const subtotal = this.totalAmount;
    const tax = subtotal * 0.05;
    const delivery = subtotal > 0 ? 50 : 0;
    return subtotal + tax + delivery;
  }

  /** Load cart from backend and normalize veg property */
  loadCart() {
    this.cartService.getCart().subscribe({
      next: (res) => (this.cart = this.normalizeCartItems(res)),
      error: (err) => {
        console.error('Error fetching cart', err);
        this.snackBar.open('❌ Failed to load cart', 'Close', { duration: 3000 });
      }
    });
  }

  /** Normalize cart items to ensure veg is boolean for all items */
 private normalizeCartItems(cartData: any) {
  if (!cartData?.items) return { items: [] };

  cartData.items = cartData.items.map((item: any) => {
    const menuItem = item.menuItem || item.MenuItem || {};

    // Check all possible veg property names
    const vegValue = menuItem.veg ?? menuItem.Veg ?? menuItem.VEG ?? false;

    // Convert to boolean safely
    const vegBoolean = vegValue === true || vegValue === 'true';

    return {
      ...item,
      menuItem: {
        ...menuItem,
        veg: vegBoolean
      }
    };
  });

  return cartData;
}

  /** Increase item quantity */
  increase(item: any) {
    const id = item.menuItemId || item.MenuItemId;
    this.cartService.increaseQuantity(id).subscribe({
      next: () => {
        this.loadCart();
        this.snackBar.open('✅ Quantity updated', 'Close', { duration: 1500 });
      },
      error: () => this.snackBar.open('❌ Failed to update quantity', 'Close', { duration: 3000 })
    });
  }

  /** Decrease item quantity */
  decrease(item: any) {
    const id = item.menuItemId || item.MenuItemId;
    this.cartService.decreaseQuantity(id).subscribe({
      next: () => {
        this.loadCart();
        this.snackBar.open('✅ Quantity updated', 'Close', { duration: 1500 });
      },
      error: () => this.snackBar.open('❌ Failed to update quantity', 'Close', { duration: 3000 })
    });
  }

  /** Remove item from cart */
  removeItem(item: any) {
    const id = item.menuItemId || item.MenuItemId;
    this.cartService.removeFromCart(id).subscribe({
      next: () => {
        this.loadCart();
        this.snackBar.open('🗑️ Item removed from cart', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('❌ Failed to remove item', 'Close', { duration: 3000 })
    });
  }

  /** Place order */
  checkout() {
    if (!this.cart?.items || this.cart.items.length === 0) {
      this.snackBar.open('⚠️ Your cart is empty', 'Close', { duration: 2000 });
      return;
    }

    this.ordersService.placeOrder().subscribe({
      next: (res: any) => {
        this.snackBar.open('🎉 Order placed successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/order-confirmation'], { state: { order: res } });
      },
      error: () => this.snackBar.open('❌ Checkout failed. Please try again.', 'Close', { duration: 3000 })
    });
  }

  ngOnDestroy() {
    this.signalr.off('CartUpdated');
    this.signalr.off('OrderPlaced');
    this.subs.forEach((s) => s.unsubscribe());
  }
}
