import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrdersService } from '../services/orders.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;

  constructor(private ordersService: OrdersService, private router: Router) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.ordersService.history().subscribe({
      next: (res: any) => {
        this.orders = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Failed to fetch order history', err);
        this.isLoading = false;
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  viewOrderDetails(order: any) {
    this.router.navigate(['/order-confirmation'], { state: { order } });
  }

  getFinalTotal(order: any): number {
    const subtotal = order.total || order.Total || 0;
    const tax = subtotal * 0.05; // 5% tax
    const delivery = subtotal > 0 ? 50 : 0; // ₹50 delivery fee
    return Math.round((subtotal + tax + delivery) * 100) / 100; // Round to 2 decimal places
  }
}