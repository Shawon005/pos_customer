import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Product, CartItem, Sale } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pos-page">
      <header class="pos-header">
        <h1>Point of Sale</h1>
      </header>

      <div class="pos-container">
        <!-- Product Search -->
        <div class="search-section">
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

          <!-- Product Results -->
          <div class="product-results" *ngIf="searchResults.length > 0">
            <div
              *ngFor="let product of searchResults"
              class="result-item"
              (click)="addToCart(product)"
            >
              <div class="result-name">{{ product.product_name }}</div>
              <div class="result-details">
                <span>৳ {{ product.purchase_price | number: '1.0-2' }}</span>
                <span class="stock" [class.low]="product.quantity <= product.min_stock">
                  {{ product.quantity }} left
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Section -->
        <div class="cart-section">
          <div>
            <input type="text" placeholder="Retail Buyer Name..." [(ngModel)]="retailBuyerName"   class="search-input form_controll mb-4" style=""/>
          </div>
          <h2>Cart Items ({{ cart.length }})</h2>

          <div class="cart-items" *ngIf="cart.length > 0">
            <div *ngFor="let item of cart; let i = index" class="cart-item">
              <div class="item-info">
                <h4>{{ item.product.product_name }}</h4>
                <p class="item-sku">{{ item.product.sku }}</p>
              </div>

              <div class="item-quantity">
                <button (click)="decrementQuantity(i)" class="btn-qty">−</button>
                <input type="number" [(ngModel)]="item.quantity" (change)="updateCartTotal()" class="qty-input" min="1" />
                <button (click)="incrementQuantity(i)" class="btn-qty">+</button>
              </div>

              <div class="item-price">
                <p class="item-subtotal">৳ {{ item.subtotal | number: '1.0-2' }}</p>
                <button (click)="removeFromCart(i)" class="btn-remove">🗑️</button>
              </div>
            </div>
          </div>

          <div *ngIf="cart.length === 0" class="empty-cart">
            <p class="empty-icon">🛒</p>
            <p>No items in cart</p>
          </div>

          <!-- Cart Summary -->
          <div class="cart-summary" *ngIf="cart.length > 0">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>৳ {{ cartSubtotal | number: '1.0-2' }}</span>
            </div>
            <div class="summary-row">
              <label for="discount">Discount (%):</label>
              <div class="discount-input">
                <input
                  id="discount"
                  type="number"
                  [(ngModel)]="discountPercent"
                  (change)="calculateTotal()"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div class="summary-row">
              <span>Discount Amount:</span>
              <span>৳ {{ discountAmount | number: '1.0-2' }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>৳ {{ cartTotal | number: '1.0-2' }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="cart-actions" *ngIf="cart.length > 0">
            <button (click)="clearCart()" class="btn-secondary">Clear Cart</button>
            <button (click)="completeSale()" class="btn-primary" [disabled]="isProcessing">
              <span *ngIf="!isProcessing">Complete Sale</span>
              <span *ngIf="isProcessing" class="spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pos-page {
      padding: 16px;
      padding-bottom: 90px;
      margin-bottom:60px;
      min-height: 100vh;
      background: #f8f9fa;
    }

    .pos-header {
      margin-bottom: 24px;
    }

    .pos-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }

    .pos-container {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 16px;
    }

    .search-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .search-box {
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

    .product-results {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 400px;
      overflow-y: auto;
    }

    .result-item {
      background: white;
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .result-item:active {
      background: #f0f4ff;
      transform: scale(0.98);
    }

    .result-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .result-details {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #999;
    }

    .result-details .stock {
      font-weight: 500;
      color: #27ae60;
    }

    .result-details .stock.low {
      color: #e74c3c;
    }

    .cart-section {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      height: fit-content;
      position: sticky;
      top: 16px;
    }

    .cart-section h2 {
      margin: 0 0 12px 0;
      font-size: 18px;
      color: #333;
    }

    .cart-items {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .cart-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 12px;
    }

    .item-info h4 {
      margin: 0;
      color: #333;
      font-size: 13px;
    }

    .item-sku {
      margin: 0;
      color: #999;
      font-size: 11px;
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-qty {
      width: 28px;
      height: 28px;
      border: 1px solid #e0e0e0;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }

    .qty-input {
      width: 50px;
      padding: 4px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      text-align: center;
      font-size: 12px;
    }

    .item-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .item-subtotal {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .btn-remove {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
    }

    .empty-cart {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .empty-icon {
      font-size: 36px;
      margin: 0 0 8px 0;
    }

    .cart-summary {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
      padding: 12px 0;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-row.total {
      font-size: 16px;
      font-weight: 700;
      color: #333;
      padding-top: 8px;
    }

    .discount-input {
      display: flex;
      align-items: center;
    }

    .discount-input input {
      width: 70px;
      padding: 4px 8px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      text-align: center;
      font-size: 12px;
    }

    .cart-actions {
      display: flex;
      gap: 8px;
    }

    .btn-secondary,
    .btn-primary {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }

    .btn-secondary:active {
      background: #e0e0e0;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:active:not(:disabled) {
      transform: scale(0.98);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .pos-container {
        grid-template-columns: 1fr;
      }

      .cart-section {
        position: relative;
        top: 0;
      }
    }

    @media (max-width: 480px) {
      .pos-page {
        padding: 12px;
      }
    }
  `]
})
export class POSComponent implements OnInit {
  cart: CartItem[] = [];
  products: Product[] = [];
  searchResults: Product[] = [];
  searchQuery = '';
  discountPercent = 0;
  cartSubtotal = 0;
  discountAmount = 0;
  cartTotal = 0;
  isProcessing = false;
  retailBuyerName: string = '';
  temp: any;
  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.apiService.getCustomerStocks().subscribe({
      next: (data) => {
        this.temp = data;
        this.products = this.temp.data;
        console.log('Products loaded:', this.products);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notificationService.error('Failed to load products');
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
// || p.sku.toLowerCase().includes(query)
    const query = this.searchQuery.toLowerCase();
    this.searchResults = this.products.filter(p =>
      (p.product_name.toLowerCase().includes(query) ) &&
      p.quantity > 0
    );
  }

  addToCart(product: Product): void {
    console.log('Adding to cart:', product);
    const existingItem = this.cart.find(item => item.product.product_id === product.product_id);

    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        existingItem.quantity++;
        this.updateCartTotal();
      } else {
        this.notificationService.warning('Insufficient stock');
      }
    } else {
      this.cart.push({
        product,
        quantity: 1,
        subtotal: product.purchase_price
      });
      this.updateCartTotal();
    }

    this.searchQuery = '';
    this.searchResults = [];
  }

  incrementQuantity(index: number): void {
    const item = this.cart[index];
    if (item.quantity < item.product.quantity) {
      item.quantity++;
      this.updateCartTotal();
    } else {
      this.notificationService.warning('Insufficient stock');
    }
  }

  decrementQuantity(index: number): void {
    const item = this.cart[index];
    if (item.quantity > 1) {
      item.quantity--;
      this.updateCartTotal();
    }
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    this.updateCartTotal();
  }

  clearCart(): void {
    this.cart = [];
    this.discountPercent = 0;
    this.updateCartTotal();
  }

  updateCartTotal(): void {
    this.cartSubtotal = this.cart.reduce((sum, item) => {
      item.subtotal = item.product.purchase_price * item.quantity;
      return sum + item.subtotal;
    }, 0);
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.discountAmount = (this.cartSubtotal * this.discountPercent) / 100;
    this.cartTotal = this.cartSubtotal - this.discountAmount;
  }

  completeSale(): void {
    if (this.cart.length === 0) {
      this.notificationService.warning('Cart is empty');
     
      return;
    }

    //this.isProcessing = true;

    const saleData = {
      items: this.cart.map(item => ({
        product_id: item.product.product_id,
        quantity: item.quantity,
        name: item.product.product_name,
        sale_price: item.product.purchase_price
      })),
      sale_price: this.cartTotal,
      discount: this.discountAmount,
      payment_method: 'cash',
      sold_to: this.retailBuyerName || ''
    };

    this.apiService.processSale(saleData).subscribe({
      next: (sale) => {
        console.log('Sale completed:', sale);
        this.isProcessing = false;
        this.notificationService.success(`Sale completed!`);
        this.cart = [];
        this.discountPercent = 0;
        this.updateCartTotal();
        
      },
      error: (error) => {
        this.isProcessing = false;
        const message = error.error?.message || 'Failed to complete sale';
        this.notificationService.error(message);
      }
    });
    this.clearCart()
  }
}
