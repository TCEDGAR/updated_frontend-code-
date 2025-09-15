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

  constructor(private ordersService: OrdersService, private router: Router) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.ordersService.history().subscribe({
      next: (res: any) => this.orders = res,
      error: (err) => console.error('❌ Failed to fetch order history', err)
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  viewOrderDetails(order: any) {
    this.router.navigate(['/order-confirmation'], { state: { order } });
  }
}
