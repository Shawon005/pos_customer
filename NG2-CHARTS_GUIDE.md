# Optional: ng2-Charts Integration Guide

This guide shows how to integrate **ng2-charts** for enhanced chart visualizations.

## 📊 Why ng2-Charts?

- Better looking charts
- Multiple chart types (Line, Bar, Pie, Doughnut, etc.)
- Interactive tooltips
- Responsive design
- Easy customization

---

## 1️⃣ Installation

```bash
npm install ng2-charts chart.js
```

---

## 2️⃣ Update Dashboard with Charts

Replace the simple bar chart with a professional line chart.

### Updated Dashboard Component

```typescript
// src/app/features/dashboard/components/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { DashboardStats, SalesChartData } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
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
              <p class="stat-value">{{ stats?.total_stock_items || 0 }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <p class="stat-label">Sales Today</p>
              <p class="stat-value">৳ {{ stats?.total_sales_today | number: '1.0-2' || '0' }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-info">
              <p class="stat-label">Profit Today</p>
              <p class="stat-value">৳ {{ stats?.total_profit_today | number: '1.0-2' || '0' }}</p>
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
        <div class="chart-section" *ngIf="chartData.length > 0">
          <h2>Sales Trend (Last 7 Days)</h2>
          <div class="chart-container">
            <canvas
              baseChart
              [data]="lineChartData"
              [options]="lineChartOptions"
              type="line"
              [hidden]="false"
            ></canvas>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-grid">
            <a href="/pos" class="action-btn">
              <span class="action-icon">🛒</span>
              <span>New Sale</span>
            </a>
            <a href="/stock" class="action-btn">
              <span class="action-icon">📦</span>
              <span>View Stock</span>
            </a>
            <a href="/sales" class="action-btn">
              <span class="action-icon">📋</span>
              <span>Sales History</span>
            </a>
            <a href="/reports" class="action-btn">
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
      position: relative;
      height: 300px;
      width: 100%;
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
  isLoading = true;

  lineChartData: any;
  lineChartOptions: ChartConfiguration['options'];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {
    this.initializeChart();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private initializeChart(): void {
    this.lineChartData = {
      labels: [],
      datasets: [
        {
          label: 'Daily Sales',
          data: [],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              size: 12,
              weight: '600'
            },
            color: '#333',
            boxWidth: 12
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: { size: 13, weight: '600' },
          bodyFont: { size: 12 },
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context: any) => {
              return '৳ ' + context.parsed.y.toLocaleString();
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#999',
            font: { size: 11 },
            callback: (value: any) => {
              return '৳ ' + value.toLocaleString();
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: '#999',
            font: { size: 11 }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        }
      }
    };
  }

  private loadDashboardData(): void {
    this.apiService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.notificationService.error('Failed to load dashboard data');
      }
    });

    this.apiService.getSalesChart().subscribe({
      next: (data) => {
        this.chartData = data;
        this.updateChart(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sales chart:', error);
        this.isLoading = false;
      }
    });
  }

  private updateChart(data: SalesChartData[]): void {
    this.lineChartData.labels = data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    this.lineChartData.datasets[0].data = data.map(d => d.sales);
  }
}
```

---

## 3️⃣ Add Chart to Reports Page

```typescript
// src/app/features/reports/components/reports.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="reports-page">
      <header class="reports-header">
        <h1>Reports</h1>
      </header>

      <div class="content">
        <!-- Pie Chart - Sales by Category -->
        <div class="chart-card" *ngIf="pieChartData">
          <h3>Sales by Category</h3>
          <div class="chart-wrapper">
            <canvas
              baseChart
              [data]="pieChartData"
              [options]="pieChartOptions"
              type="pie"
            ></canvas>
          </div>
        </div>

        <!-- Bar Chart - Monthly Comparison -->
        <div class="chart-card" *ngIf="barChartData">
          <h3>Monthly Sales Comparison</h3>
          <div class="chart-wrapper">
            <canvas
              baseChart
              [data]="barChartData"
              [options]="barChartOptions"
              type="bar"
            ></canvas>
          </div>
        </div>

        <!-- Report Cards -->
        <div class="report-card">
          <div class="report-header">
            <h3>📅 Daily Sales</h3>
          </div>
          <div class="report-data">
            <div class="data-item">
              <span class="label">Today's Sales:</span>
              <span class="value">৳ 0.00</span>
            </div>
            <div class="data-item">
              <span class="label">Transactions:</span>
              <span class="value">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-page {
      padding: 16px;
      padding-bottom: 90px;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .reports-header {
      margin-bottom: 24px;
    }

    .reports-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .chart-card h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #333;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
      width: 100%;
    }

    .report-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .report-header h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
      color: #333;
      font-weight: 600;
    }

    .report-data {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .data-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 12px;
      color: #999;
      font-weight: 500;
    }

    .value {
      font-size: 16px;
      font-weight: 700;
      color: #333;
    }

    @media (max-width: 480px) {
      .reports-page {
        padding: 12px;
      }

      .report-data {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  pieChartData: any;
  pieChartOptions: ChartConfiguration['options'];
  barChartData: any;
  barChartOptions: ChartConfiguration['options'];

  constructor(private apiService: ApiService) {
    this.initializeCharts();
  }

  ngOnInit(): void {
    // Charts will be populated from API data
  }

  private initializeCharts(): void {
    // Pie Chart
    this.pieChartData = {
      labels: ['Electronics', 'Clothing', 'Food', 'Home'],
      datasets: [
        {
          data: [30, 25, 20, 25],
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#f39c12',
            '#27ae60'
          ],
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    };

    this.pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 12 },
            color: '#333',
            padding: 15,
            boxWidth: 12
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return context.label + ': ' + context.parsed + '%';
            }
          }
        }
      }
    };

    // Bar Chart
    this.barChartData = {
      labels: ['January', 'February', 'March', 'April', 'May'],
      datasets: [
        {
          label: 'Sales',
          data: [3000, 2500, 4000, 3500, 4500],
          backgroundColor: '#667eea',
          borderRadius: 4
        },
        {
          label: 'Profit',
          data: [600, 500, 800, 700, 900],
          backgroundColor: '#764ba2',
          borderRadius: 4
        }
      ]
    };

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: { size: 12 },
            color: '#333'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#999'
          }
        },
        x: {
          ticks: {
            color: '#999'
          }
        }
      }
    };
  }
}
```

---

## 4️⃣ Installation Verification

```bash
# Check if ng2-charts is installed
npm list ng2-charts chart.js

# Should output:
# ng2-charts@<version>
# chart.js@<version>
```

---

## 5️⃣ Chart Types You Can Use

```typescript
// Line Chart
<canvas baseChart [data]="lineChartData" type="line"></canvas>

// Bar Chart
<canvas baseChart [data]="barChartData" type="bar"></canvas>

// Pie Chart
<canvas baseChart [data]="pieChartData" type="pie"></canvas>

// Doughnut Chart
<canvas baseChart [data]="doughnutChartData" type="doughnut"></canvas>

// Radar Chart
<canvas baseChart [data]="radarChartData" type="radar"></canvas>

// Bubble Chart
<canvas baseChart [data]="bubbleChartData" type="bubble"></canvas>
```

---

## 6️⃣ Customization Options

```typescript
// Change colors
backgroundColor: [
  '#667eea',
  '#764ba2',
  '#f39c12',
  '#27ae60',
  '#e74c3c'
]

// Change borders
borderColor: '#667eea',
borderWidth: 2,

// Change animation
animation: {
  duration: 1000
},

// Add gradient
let ctx = canvas.getContext('2d');
let gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(102, 126, 234, 0.5)');
gradient.addColorStop(1, 'rgba(102, 126, 234, 0.1)');
backgroundColor: gradient,
```

---

## 7️⃣ Common Issues & Solutions

### Issue: Charts not displaying
```typescript
// Ensure chart wrapper has height
.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}
```

### Issue: Charts not responsive
```typescript
// Enable responsive
responsive: true,
maintainAspectRatio: false,
```

### Issue: Memory leak with multiple charts
```typescript
// Properly clean up on destroy
ngOnDestroy() {
  // Chart.js will auto-cleanup
}
```

---

## 8️⃣ Performance Tips

1. **Use virtual scrolling for many charts**
2. **Lazy load chart library**
3. **Cache chart data**
4. **Debounce window resize events**

```typescript
import { debounceTime } from 'rxjs';

window.addEventListener('resize', () => {
  // Update charts
});
```

---

## ✅ Next Steps

1. Install: `npm install ng2-charts chart.js`
2. Import NgChartsModule in components
3. Update Dashboard and Reports components
4. Test chart rendering
5. Customize colors/styles
6. Deploy

---

**Happy Charting! 📊**
