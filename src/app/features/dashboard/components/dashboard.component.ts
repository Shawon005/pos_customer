import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { DashboardStats, SalesChartData } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <p class="date">{{ currentDate | date: 'EEE, MMM d, yyyy' }}</p>
      </header>

      <div class="content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
              <p class="stat-label">Total Stock Items</p>
              <p class="stat-value">{{ stats?.total_stock_items  }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <p class="stat-label">Sales Today</p>
              <p class="stat-value">৳ {{ stats?.today_sales  }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-info">
              <p class="stat-label">Total Stock Value</p>
              <p class="stat-value">৳ {{ stats?.total_stock_value  }}</p>
            </div>
          </div>

          <div class="stat-card warning" *ngIf="stats?.low_stock_count">
            <div class="stat-icon">⚠️</div>
            <div class="stat-info">
              <p class="stat-label">Low Stock Items</p>
              <p class="stat-value">{{ stats?.low_stock_count }}</p>
            </div>
          </div>
        </div>

        <!-- Sales Chart -->
        <!-- <div class="chart-section" *ngIf="chartData.length > 0">
          <h2>Sales Trend (Last 7 Days)</h2>
          <div class="chart-container">
            <div class="chart-bar" *ngFor="let data of chartData">
              <div class="bar-label">{{ data.date | date: 'MMM d' }}</div>
              <div class="bar-wrapper">
                <div 
                  class="bar" 
                  [style.height.%]="(data.sales / maxChartValue) * 100"
                  [title]="'৳ ' + data.sales"
                ></div>
              </div>
              <div class="bar-value">৳ {{ data.sales | number: '1.0-0' }}</div>
            </div>
          </div>
        </div> -->

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-grid">
            <a routerLink="/pos" class="action-btn">
              <span class="action-icon">🛒</span>
              <span>New Sale</span>
            </a>
            <a routerLink="/stock" class="action-btn">
              <span class="action-icon">📦</span>
              <span>View Stock</span>
            </a>
            <a routerLink="/sales" class="action-btn">
              <span class="action-icon">📋</span>
              <span>Sales History</span>
            </a>
            <a routerLink="/reports" class="action-btn">
              <span class="action-icon">📊</span>
              <span>Reports</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 16px;
      padding-bottom: 90px;
      margin-bottom:60px;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .dashboard-header {
      margin-bottom: 24px;
    }

    .dashboard-header h1 {
      margin: 0 0 4px 0;
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .date {
      margin: 0;
      color: #999;
      font-size: 14px;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
    }

    .stat-card:active {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-card.warning {
      background: #fffbf0;
      border-left: 4px solid #f39c12;
    }

    .stat-icon {
      font-size: 28px;
      flex-shrink: 0;
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      margin: 0;
      font-size: 13px;
      color: #999;
      font-weight: 500;
    }

    .stat-value {
      margin: 4px 0 0 0;
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }

    .chart-section {
      background: white;
      border-radius: 12px;
      padding: 20px 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .chart-section h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #333;
    }

    .chart-container {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 180px;
      gap: 8px;
    }

    .chart-bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .bar-label {
      font-size: 12px;
      color: #999;
      text-align: center;
      order: 3;
    }

    .bar-wrapper {
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      width: 100%;
    }

    .bar {
      width: 100%;
      max-width: 30px;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      border-radius: 6px 6px 0 0;
      min-height: 10px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .bar:hover {
      opacity: 0.8;
    }

    .bar-value {
      font-size: 11px;
      color: #667eea;
      font-weight: 600;
      order: 2;
    }

    .quick-actions {
      background: white;
      border-radius: 12px;
      padding: 20px 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .quick-actions h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #333;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      text-decoration: none;
      color: #333;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }

    .action-btn:active {
      background: #e8eaf6;
      transform: scale(0.98);
    }

    .action-icon {
      font-size: 28px;
    }

    .action-btn span:last-child {
      font-size: 13px;
      font-weight: 600;
    }

    @media (max-width: 480px) {
      .dashboard {
        padding: 12px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .action-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  chartData: SalesChartData[] = [];
  currentDate = new Date();
  maxChartValue = 1;
  isLoading = true;
  temp: any;
  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,private router: Router
  ) {
   this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
       this.loadDashboardData();
  }

private async loadDashboardData(): Promise<void> {
   this.notificationService.success('Dashboard data loaded successfully');
  try {
    const data = await firstValueFrom(this.apiService.getDashboardStats());
    this.temp = data;
    this.stats = this.temp.data;
    console.log('Dashboard stats loaded:', this.stats);
     
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    this.notificationService.error('Failed to load dashboard data');
  }


    // this.apiService.getSalesChart().subscribe({
    //   next: (data) => {
    //     this.chartData = data;
    //     this.maxChartValue = Math.max(...data.map(d => d.sales), 1);
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading sales chart:', error);
    //     this.isLoading = false;
    //   }
    // });
  }
}
