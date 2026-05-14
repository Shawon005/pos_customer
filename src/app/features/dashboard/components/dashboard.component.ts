import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { DashboardStats, SalesChartData } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Customer } from '../../../core/models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header class="profile-card">
        <div class="avatar">{{ customer?.name?.charAt(0) || 'U' }}</div>
        <div class="profile-info">
          <h2>{{ customer?.name || 'User' }}</h2>
          <p>{{ customer?.email || 'POS Customer' }}</p>
        </div>
      </header>

      <div class="tiles-grid">
        <a routerLink="/attendance/action" class="tile"><span>🕒</span><b>Attendance</b></a>
        <a routerLink="/attendance/details" class="tile"><span>📅</span><b>Attendance Details</b></a>
        <a routerLink="/stock" class="tile"><span>📦</span><b>Stock</b></a>
        <a routerLink="/pos" class="tile"><span>🛒</span><b>New Sale</b></a>
        <a routerLink="/sales" class="tile"><span>📋</span><b>Sales History</b></a>
        <a routerLink="/reports" class="tile"><span>📊</span><b>Report</b></a>
        <a routerLink="/profile" class="tile"><span>👷🏻‍♂️</span><b>Profile</b></a>
        <a routerLink="/shop-owners" class="tile"><span>🏬</span><b>Shop</b></a>
        <!-- <a routerLink="/login" class="tile"><span>🔒</span><b>Logout</b></a> -->
      </div>

      <div class="summary-strip">
        <div class="mini"><small>💰 Target</small><strong>{{ stats?.total_sale_target_amount || 0 }} ৳</strong></div>
        <div class="mini"><small>💰 Today</small><strong> {{ stats?.today_sales || 0 }} ৳</strong></div>
        <div class="mini"><small>💰 Total Sales</small><strong> {{ stats?.today_sales || 0 }} ৳</strong></div>
        <div class="mini low" *ngIf="stats?.low_stock_count"><small>⚠ Low</small><strong>{{ stats?.low_stock_count }}</strong></div>
      </div>

      <div class="location-card">
        <div class="location-title">Area Name</div>
        <div class="location-value">{{ customer?.address || 'Location not set' }}</div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 14px; padding-bottom: 90px; min-height: 100vh; background: #000; }
    .profile-card { display: flex; align-items: center; gap: 12px; padding: 14px; background: #292828; border: 1px solid #f7941d; border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.28); margin-bottom: 12px; }
    .avatar { width: 54px; height: 54px; border-radius: 50%; background: #f7941d; color: #111; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; }
    .profile-info h2 { margin: 0; color: #fff; font-size: 26px; line-height: 1.1; }
    .profile-info p { margin: 4px 0 0; color: #bbb; font-size: 13px; }
    .tiles-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .tile { background: #ff9f2d; border-radius: 14px; min-height: 92px; text-decoration: none; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 3px 10px rgba(0,0,0,0.18); border: 1px solid #f7941d; }
    .tile span { width: 34px; height: 34px; border-radius: 50%; background: #050505; color: #7f3f00; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }
    .tile b { font-size: 15px; font-weight: 600; }
    .summary-strip { margin-top: 12px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .mini { border-radius: 12px; background: #292828; border: 1px solid #f7941d; padding: 10px; color: #fff; text-align: center; }
    .mini.low { border-color: #ffb84d; box-shadow: inset 0 0 0 1px rgba(255,184,77,0.25); }
    .mini small { display: block; color: #bbb; font-size: 11px; }
    .mini strong { font-size: 14px; }
    .location-card { margin-top: 12px; border-radius: 14px; background: #ededed; border: 1px solid #f7941d; padding: 12px; }
    .location-title { font-weight: 700; color: #7f3f00; margin-bottom: 6px; }
    .location-value { font-size: 14px; color: #333; }
    @media (max-width: 420px) { .profile-info h2 { font-size: 22px; } .tile { min-height: 88px; } .tile b { font-size: 14px; } }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  chartData: SalesChartData[] = [];
  currentDate = new Date();
  maxChartValue = 1;
  isLoading = true;
  temp: any;
  customer: Customer | null = null;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.customer = this.authService.getCustomer();
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.apiService.getDashboardStats().subscribe({
      next: (data: any) => {
        this.temp = data;
        this.stats = this.temp?.data ?? this.temp;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
        this.notificationService.error('Failed to load dashboard data');
        this.cdr.detectChanges();
      }
    });
  }
}
