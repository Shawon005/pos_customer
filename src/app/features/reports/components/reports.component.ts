import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-page">
      <header class="reports-header">
        <h1>Reports</h1>
      </header>

      <div class="content">
        <div class="report-card">
          <div class="report-header">
            <h3>Daily Sales</h3>
          </div>
          <div class="report-data">
            <div class="data-item">
              <span class="label">Today's Sales:</span>
              <span class="value">{{ reportData.total_daily_sales | number:'1.2-2' }}</span>
            </div>
            <div class="data-item">
              <span class="label">Transactions:</span>
              <span class="value">0</span>
            </div>
          </div>
          <button class="btn-view">View Details</button>
        </div>

        <div class="report-card">
          <div class="report-header">
            <h3>Weekly Sales</h3>
          </div>
          <div class="report-data">
            <div class="data-item">
              <span class="label">This Week:</span>
              <span class="value">{{ reportData.total_weekly_sales | number:'1.2-2' }}</span>
            </div>
            <div class="data-item">
              <span class="label">Avg/Day:</span>
              <span class="value">0.00</span>
            </div>
          </div>
          <button class="btn-view">View Details</button>
        </div>

        <div class="report-card">
          <div class="report-header">
            <h3>Monthly Sales</h3>
          </div>
          <div class="report-data">
            <div class="data-item">
              <span class="label">This Month:</span>
              <span class="value">{{ reportData.total_monthly_sales | number:'1.2-2' }}</span>
            </div>
            <div class="data-item">
              <span class="label">Avg/Day:</span>
              <span class="value">0.00</span>
            </div>
          </div>
          <button class="btn-view">View Details</button>
        </div>

        <div class="report-card">
          <div class="report-header">
            <h3>Profit Report</h3>
          </div>
          <div class="report-data">
            <div class="data-item">
              <span class="label">Total Profit:</span>
              <span class="value profit">0.00</span>
            </div>
            <div class="data-item">
              <span class="label">Profit Margin:</span>
              <span class="value">0%</span>
            </div>
          </div>
          <button class="btn-view">View Details</button>
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
      gap: 12px;
    }

    .report-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
    }

    .report-card:active {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e0e0e0;
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

    .value.profit {
      color: #27ae60;
    }

    .btn-view {
      width: 100%;
      padding: 10px;
      background: #f0f4ff;
      color: #667eea;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-view:active {
      background: #e8eaf6;
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
  reportData = {
    total_daily_sales: 0,
    total_weekly_sales: 0,
    total_monthly_sales: 0
  };

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

   ngOnInit(): void {
    this.loadAppReport();
    setTimeout(() => { 
       console.log('ReportsComponent initialized', this.reportData);
     }, 2000);
    
   
  }

  private  loadAppReport(): void {
     this.apiService.getAppReport().subscribe({
      next: (response: any) => {
        const payload = response?.data ?? response?.result?.data ?? response ?? {};

        this.reportData = {
          total_daily_sales: this.toNumber(payload?.total_daily_sales),
          total_weekly_sales: this.toNumber(payload?.total_weekly_sales),
          total_monthly_sales: this.toNumber(payload?.total_monthly_sales)
        };
        this.cdr.detectChanges();
      },
      error: () => {
        this.notificationService.error('Failed to load report data');
      }
    });
  }

  private toNumber(value: unknown): number {
    if (value === null || value === undefined) return 0;
    const normalized = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
