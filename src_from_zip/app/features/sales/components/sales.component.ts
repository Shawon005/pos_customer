import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
          <button class="btn-print" (click)="printReceipt()">Print</button>

          <div class="modal-items">
            <h3>Items</h3>
            <div *ngFor="let item of selectedSale.items" class="modal-item">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-qty">{{ item.quantity }} × ৳ {{ item.sale_price | number: '1.0-2' }}</div>
              <div class="item-total">৳ {{ item.quantity*item.sale_price | number: '1.0-2' }}</div>
              <div *ngIf="(item.free_item)">Free Item: {{item.free_item}}</div>
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
            <div id="print-receipt" class="print-receipt">
              <div class="receipt">
                <div style="text-align: center; margin:5px" >
                <img width="150" style="text-align: center;" src="data:image/jpeg;base64,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" alt="">
                </div>

                <h2 style="margin-bottom: 24px;">Nick Electro Co.</h2>
                <p>Date: {{ currentDate | date:'dd-MM-yyyy HH:mm:ss' }}</p>
                <p>Buyer: {{ resaleer || 'Retail Customer' }}</p>
                <hr>

                <table>
                  <tr>
                      <th style="text-align:left;font-weight:600;">Product Name</th>
                      <th style="font-weight:600;">Qty</th>
                      <th style="font-weight:600;">Free</th>
                      <th style="font-weight:600;">Price</th>
                      <th style="text-align:right;font-weight:600;">Total</th>
                  </tr>
                  <tr *ngFor="let item of lastSaleItems">  
                    <td>{{ item.name }}</td>

                    <td style="text-align:center;font-weight:400;">{{item.quantity}}</td>
                    <td style="text-align:center;font-weight:400;"> {{item.free_item}}</td>
                    <td style="text-align:center;font-weight:400;">{{item.sale_price}}৳</td>
                    <td style="text-align:right;font-weight:400;">  {{item.sale_price*item.quantity}}৳</td>
                  </tr>
                </table>

                <hr>
                <p>Subtotal: ৳ {{ lastSubtotal | number:'1.0-2' }}</p>
                <p>Discount: ৳ {{ lastDiscount | number:'1.0-2' }}</p>
                <h3>Total: {{ lastTotal | number:'1.0-2' }}৳</h3>

                <p style="text-align:center;margin-top:10px;">Thank You ❤️</p>
              </div>
            </div>
      </div>
  `,
  styles: [`
      .print-receipt {
      display: none;
    }
    .btn-print{
      padding: 5px 12px 5px 12px;
      border-radius: 11px;
      background: #f79600;
      color: #fff;
    }
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
    lastSaleItems: any[] = [];
  lastSubtotal = 0;
  lastDiscount = 0;
  lastTotal = 0;
  currentDate : any;
  resaleer:any=''
  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }
    printReceipt(): void {
    const printContents = document.getElementById('print-receipt')?.innerHTML;
    const popup = window.open('', '_blank', 'width=400');

    if (popup && printContents) {
      popup.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { font-family: Arial; font-size: 12px; padding: 10px; }
              table { width: 100%; }
              td { padding: 4px 0; }
              hr { margin: 6px 0; }
              h2, h3 { text-align: center; margin: 5px 0; }
              table {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #ddd;
  padding: 8px;
}

tr:nth-child(even){background-color: #f2f2f2;}

tr:hover {background-color: #ddd;}


            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);

      popup.document.close();
      popup.print();
    }
  }
  private loadSales(): void {
    this.isLoading = true;
    this.apiService.getSalesHistory().subscribe({
      next: (data) => {
        this.temp = data;
        this.sales = this.temp?.data ?? [];
        this.filteredSales = this.temp?.data ?? [];
        console.log('Loaded sales:', this.filteredSales);
        this.isLoading = false;
        this.notificationService.success('Sales data loaded successfully');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.notificationService.error('Failed to load sales data');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterSales(): void {
    this.isLoading = false;
    this.dateFrom, this.dateTo
    console.log('Filtering sales from:', this.dateFrom, 'to:', this.dateTo);
    this.filteredSales = this.sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      saleDate.setHours(0, 0, 0, 0); // Normalize to start of day
      const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
      const toDate = this.dateTo ? new Date(this.dateTo) : null;
      console.log('Sale date:', fromDate && saleDate < fromDate, 'From date:', toDate && saleDate > toDate, 'Sale:', saleDate);
      if (fromDate && saleDate < fromDate) {
        return false;
      }
      if (toDate && saleDate > toDate) {
        return false;
      }
      return true;
    });
    // this.apiService.getSalesHistory(this.dateFrom, this.dateTo).subscribe({
    //   next: (data) => {
    //     this.temp = data;
    //     this.filteredSales = this.temp.data;
    //     this.isLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error filtering sales:', error);
    //     this.notificationService.error('Failed to filter sales');
    //     this.isLoading = false;
    //   }
    // });
  }

  viewDetails(sale: Sale): void {
   
    this.selectedSale = { ...sale };
    this.lastSaleItems = this.selectedSale.items;
    this.lastSubtotal = this.selectedSale.sale_price + this.selectedSale.discount;
    this.lastDiscount = this.selectedSale.discount;
    this.lastTotal = this.selectedSale.sale_price;
    this.resaleer = this.selectedSale.sold_to;
    this.currentDate=this.selectedSale.created_at;
    // this.selectedSale.items = JSON.parse(sale.items as unknown as string);
     console.log('Viewing details for sale:',  this.selectedSale);
  }

  closeDetails(): void {
    this.selectedSale = null;
  }
}
