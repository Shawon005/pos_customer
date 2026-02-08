import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stock-page">
      <header class="stock-header">
        <h1>Inventory</h1>
      </header>

      <div class="content">
        <!-- Search and Filter -->
        <div class="search-filter">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search product..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              class="search-input"
            />
          </div>

          <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()" class="category-filter">
            <option value="">All Categories</option>
            <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
          </select>
        </div>

        <!-- Stock List -->
        <div class="stock-list" *ngIf="!isLoading">
          <div *ngIf="filteredProducts.length === 0" class="empty-state">
            <p class="empty-icon">📦</p>
            <p class="empty-text">No products found</p>
          </div>

          <div *ngFor="let product of filteredProducts" class="stock-card">
            <div class="product-image" *ngIf="product.image_url">
              <img [src]="product.image_url" [alt]="product.product_name" />
            </div>
            <div class="product-image empty" *ngIf="!product.image_url">
              <span>📷</span>
            </div>

            <div class="product-info">
              <h3>{{ product.product_name }}</h3>
              <p class="sku">SKU: {{ product.sku }}</p>
              <p class="category">{{ product.category }}</p>
            </div>

            <div class="product-details">
              <div class="detail-row">
                <span class="label">Available:</span>
                <span [class.low-stock]="product.quantity <= product.min_stock" class="value">
                  {{ product.quantity }} units
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Price:</span>
                <span class="value">৳ {{ product.purchase_price | number: '1.0-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading Spinner -->
        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stock-page {
      padding: 16px;
      padding-bottom: 90px;
      margin-bottom:60px;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .stock-header {
      margin-bottom: 24px;
    }

    .stock-header h1 {
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

    .search-filter {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 200px;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      font-size: 18px;
    }

    .search-input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .category-filter {
      padding: 12px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
      transition: border-color 0.3s;
    }

    .category-filter:focus {
      outline: none;
      border-color: #667eea;
    }

    .stock-list {
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

    .empty-text {
      margin: 0;
      font-size: 16px;
    }

    .stock-card {
      background: white;
      border-radius: 12px;
      padding: 12px;
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 12px;
      align-items: start;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
    }

    .stock-card:active {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .product-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-image.empty {
      font-size: 32px;
    }

    .product-info {
      min-width: 0;
    }

    .product-info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: #333;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sku {
      margin: 2px 0;
      font-size: 12px;
      color: #999;
    }

    .category {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #667eea;
      font-weight: 500;
    }

    .product-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: right;
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .label {
      font-size: 11px;
      color: #999;
      font-weight: 500;
    }

    .value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .low-stock {
      color: #e74c3c !important;
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

    @media (max-width: 480px) {
      .stock-page {
        padding: 12px;
      }

      .stock-card {
        grid-template-columns: 70px 1fr;
      }

      .product-details {
        grid-column: 2;
      }

      .product-image {
        width: 70px;
        height: 70px;
      }

      .search-filter {
        flex-direction: column;
      }

      .search-box {
        min-width: auto;
      }
    }
  `]
})
export class StockComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  searchQuery = '';
  selectedCategory = '';
  isLoading = true
  temp: any;
  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
    // this.loadCategories();
  }

  private async loadProducts(): Promise<void> {
    await this.apiService.getCustomerStocks().subscribe({
      next: (data) => {
        this.temp = data;
        this.products = this.temp.data;
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notificationService.error('Failed to load products');
        this.isLoading = false;
      }
    });
  }

  private loadCategories(): void {
    this.apiService.getStockCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.products;

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.product_name.toLowerCase().includes(query) 
        // p.sku.toLowerCase().includes(query)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    this.filteredProducts = filtered;
  }
}
