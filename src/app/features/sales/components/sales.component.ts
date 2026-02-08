import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Sale } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';
import { json } from 'stream/consumers';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sales-page">
      <header class="sales-header">
        <h1>Sales History</h1>
      </header>

      <div class="content">
        <!-- Date Filter -->
        <div class="filter-section">
          <div class="date-range">
            <div class="date-input-group">
              <label>From:</label>
              <input type="date" [(ngModel)]="dateFrom" (change)="filterSales()" />
            </div>
            <div class="date-input-group">
              <label>To:</label>
              <input type="date" [(ngModel)]="dateTo" (change)="filterSales()" />
            </div>
          </div>
        </div>

        <!-- Sales List -->
        <div class="sales-list" *ngIf="!isLoading">
          <div *ngIf="filteredSales.length === 0" class="empty-state">
            <p class="empty-icon">📋</p>
            <p>No sales found</p>
          </div>

          <div *ngFor="let sale of filteredSales" class="sale-card" (click)="viewDetails(sale)">
            <div class="sale-header">
              <div class="invoice-info">
                <h3>Invoice #{{ sale.invoice_number }}</h3>
                <p class="sale-date">{{ sale.created_at | date: 'MMM d, yyyy - hh:mm a' }}</p>
              </div>
              <div class="sale-status">
                <span class="badge">{{ sale.quantity }} items</span>
              </div>
            </div>

            <div class="sale-details">
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value">৳ {{ sale.sale_price | number: '1.0-2' }}</span>
              </div>
              <div class="detail-row" *ngIf="sale.profit">
                <span class="label">Profit:</span>
                <span class="value profit">৳ {{ sale.profit | number: '1.0-2' }}</span>
              </div>
            </div>

            <div class="sale-items-preview">
              <div *ngFor="let item of sale.items | slice:0:2" class="item-preview">
                <span>{{ item.product_name }} × {{ item.quantity }}</span>
              </div>
              <!-- <div *ngIf="sale.items!.length > 2" class="items-more">
                +{{ sale.items.length - 2 }} more item(s)
              </div> -->
            </div>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Loading sales...</p>
        </div>
      </div>

      <!-- Details Modal -->
      <div class="modal" *ngIf="selectedSale" (click)="closeDetails()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="modal-close" (click)="closeDetails()">×</button>

          <h2>Invoice #{{ selectedSale.invoice_number }}</h2>
          <p class="modal-date">{{ selectedSale.created_at | date: 'MMM d, yyyy - hh:mm a' }}</p>

          <div class="modal-items">
            <h3>Items</h3>
            <div *ngFor="let item of selectedSale.items" class="modal-item">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-qty">{{ item.quantity }} × ৳ {{ item.sale_price | number: '1.0-2' }}</div>
              <div class="item-total">৳ {{ item.quantity*item.sale_price | number: '1.0-2' }}</div>
            </div>
          </div>

          <div class="modal-summary">
            <div class="summary-row">
              <span>Total:</span>
              <span>৳ {{ selectedSale.sale_price | number: '1.0-2' }}</span>
            </div>
            <div class="summary-row" *ngIf="selectedSale.profit">
              <span>Profit:</span>
              <span>৳ {{ selectedSale.profit | number: '1.0-2' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sales-page {
      padding: 16px;
      padding-bottom: 90px;
      margin-bottom:60px;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .sales-header {
      margin-bottom: 24px;
    }

    .sales-header h1 {
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

    .filter-section {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .date-range {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .date-input-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 150px;
    }

    .date-input-group label {
      font-size: 12px;
      font-weight: 600;
      color: #999;
    }

    .date-input-group input {
      padding: 8px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 13px;
    }

    .date-input-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .sales-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-icon {
      font-size: 48px;
      margin: 0 0 16px 0;
    }

    .sale-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .sale-card:active {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .sale-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 12px;
    }

    .invoice-info h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 700;
      color: #333;
    }

    .sale-date {
      margin: 0;
      font-size: 12px;
      color: #999;
    }

    .sale-status {
      display: flex;
      gap: 8px;
    }

    .badge {
      background: #e8eaf6;
      color: #667eea;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .sale-details {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .detail-row {
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

    .sale-items-preview {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
      color: #666;
    }

    .item-preview {
      display: flex;
      justify-content: space-between;
    }

    .items-more {
      color: #999;
      font-style: italic;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Modal Styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: flex-end;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      background: white;
      width: 100%;
      border-radius: 16px 16px 0 0;
      padding: 24px;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      animation: slideUp 0.3s ease;
    }

    .modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #999;
    }

    .modal-content h2 {
      margin: 0 0 4px 0;
      font-size: 22px;
      color: #333;
    }

    .modal-date {
      margin: 0 0 20px 0;
      color: #999;
      font-size: 13px;
    }

    .modal-items h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #333;
    }

    .modal-item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 12px;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-item:last-child {
      border-bottom: none;
    }

    .item-name {
      font-weight: 600;
      color: #333;
    }

    .item-qty {
      font-size: 13px;
      color: #666;
    }

    .item-total {
      font-weight: 700;
      color: #667eea;
    }

    .modal-summary {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      color: #333;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @media (max-width: 480px) {
      .sales-page {
        padding: 12px;
      }

      .date-range {
        flex-direction: column;
      }
    }
  `]
})
export class SalesComponent implements OnInit {
  sales: Sale[] = [];
  filteredSales: Sale[] = [];
  dateFrom = '';
  dateTo = '';
  isLoading = false;
  selectedSale: Sale | null = null;
  temp: any;
  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  private loadSales(): void {
    this.apiService.getSalesHistory().subscribe({
      next: (data) => {
        this.temp = data;
        this.sales = this.temp.data;
        this.filteredSales = this.temp.data;
        console.log('Loaded sales:', this.filteredSales);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.notificationService.error('Failed to load sales data');
        this.isLoading = false;
      }
    });
  }

  filterSales(): void {
    this.isLoading = false;
    this.apiService.getSalesHistory(this.dateFrom, this.dateTo).subscribe({
      next: (data) => {
        this.temp = data;
        this.filteredSales = this.temp.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error filtering sales:', error);
        this.notificationService.error('Failed to filter sales');
        this.isLoading = false;
      }
    });
  }

  viewDetails(sale: Sale): void {
   
    this.selectedSale = { ...sale };
    // this.selectedSale.items = JSON.parse(sale.items as unknown as string);
     console.log('Viewing details for sale:',  this.selectedSale);
  }

  closeDetails(): void {
    this.selectedSale = null;
  }
}
