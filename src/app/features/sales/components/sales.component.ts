import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Sale } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';
import { SunmiPrinterService } from '../../../core/services/sunmi-printer.service';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';

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
          <div class="status-filters">
            <button
              type="button"
              class="status-filter-btn"
              [class.active]="selectedStatus === 'delivered'"
              (click)="setStatusFilter('delivered')"
            >
              Delivered
            </button>
            <button
              type="button"
              class="status-filter-btn"
              [class.active]="selectedStatus === 'pending'"
              (click)="setStatusFilter('pending')"
            >
              Pending
            </button>
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
                <h3>{{ sale.sold_to ?sale.sold_to:'Retail Buyer Name' }}</h3>
                <p class="sale-date">{{ sale.created_at | date: 'MMM d, yyyy - hh:mm a' }}</p>
              </div>
              <div class="sale-status">
                <span class="badge">{{ sale.quantity }} items</span>
                <span class="badge status" [class.inactive]="getSaleStatus(sale) !== 'delivered'">
                  {{ getSaleStatus(sale) | titlecase }}
                </span>
                
               
              </div>
              
            </div>
            <div class="sale-date" *ngIf="getSaleStatus(sale)=='delivered'">Delivered by: {{ sale.updated_at | date: 'MMM d, yyyy' }}</div>
            <div class="sale-details">
              <div class="detail-row">
                <span class="label">Subtotal:</span>
                <span class="value">৳ {{ getSaleSubtotal(sale) | number: '1.0-2' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Discount:</span>
                <span class="value">৳ {{ (sale.discount || 0) | number: '1.0-2' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value">৳ {{ sale.sale_price | number: '1.0-2' }}</span>
              </div>
              <div class="detail-row" *ngIf="sale.profit">
                <span class="label">Profit:</span>
                <span class="value profit">৳ {{ sale.profit | number: '1.0-2' }}</span>
              </div>
            </div>

            <!-- <div class="sale-items-preview">
              <div *ngFor="let item of sale.items | slice:0:2" class="item-preview">
                <span>{{ item.product_name }} × {{ item.quantity }}</span>
              </div>
            </div> -->

            <div class="sale-actions" (click)="$event.stopPropagation()">
              <button class="btn-action btn-edit" (click)="editSale(sale)" *ngIf="getSaleStatus(sale)!='delivered'">Edit</button>
              <button class="btn-action btn-status" (click)="openStatusPopup(sale)">Status</button>
              <button class="btn-action btn-delete" (click)="openDeletePopup(sale)"*ngIf="getSaleStatus(sale)!='delivered'">Delete</button>
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

          <h2>{{ selectedSale.sold_to ?selectedSale.sold_to:'Retail Buyer Name' }}</h2>
          <p class="modal-date">{{ selectedSale.created_at | date: 'MMM d, yyyy - hh:mm a' }}</p>
          <button class="btn-action btn-status" (click)="printReceipt()">Print</button>

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
              <span>Subtotal:</span>
              <span>৳ {{ getSaleSubtotal(selectedSale) | number: '1.0-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Discount:</span>
              <span>৳ {{ (selectedSale.discount || 0) | number: '1.0-2' }}</span>
            </div>
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
      <div class="modal" *ngIf="popupMode" (click)="closeActionPopup()">
        <div class="confirm-modal-content" (click)="$event.stopPropagation()">
          <h3>{{ popupMode === 'delete' ? 'Delete Sale' : 'Update Sale Status' }}</h3>
          <!-- <p *ngIf="popupSale">Invoice #{{ popupSale.invoice_number }}</p> -->
          <p *ngIf="popupMode === 'delete'">Are you sure you want to delete this sale?</p>
          <p *ngIf="popupMode === 'status'">Change status to <b>{{ nextStatus | titlecase }}</b>?</p>
          <div class="confirm-actions">
            <button class="btn-cancel" (click)="closeActionPopup()">Cancel</button>
            <button class="btn-confirm" (click)="confirmAction()">Confirm</button>
          </div>
        </div>
      </div>
      <div id="print-receipt" class="print-receipt">
        <div class="receipt">
          <div style="text-align: center; margin:5px" >
          <img width="150" style="text-align: center;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQsAAABYCAYAAADiONK/AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAGlmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4wLWMwMDEgNzkuYzAyMDRiMiwgMjAyMy8wMi8wOS0wNjoyNjoxNCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI0LjMgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNi0wMS0xMlQyMjoyOTozNiswNjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjYtMDEtMTlUMTM6MDY6MjArMDY6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjYtMDEtMTlUMTM6MDY6MjArMDY6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmUyZTQ0MjgyLWVkYTMtZWM0YS05M2UzLTNjMjBmZjllN2MxZSIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjNhMTk2MzQ0LWI0MjctYzk0Zi1hMjAyLTM4YWZkNGJlODdkMiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjk3OTc3OTc0LWUyOGUtNGQ0YS04M2VjLWM5ZjQ2N2RmOTcyNyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6OTc5Nzc5NzQtZTI4ZS00ZDRhLTgzZWMtYzlmNDY3ZGY5NzI3IiBzdEV2dDp3aGVuPSIyMDI2LTAxLTEyVDIyOjI5OjM2KzA2OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjQuMyAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmQ4MTQ2N2VkLThkNDAtMmE0OC05NWQ0LTNlNjU0MjVkYzc0ZSIgc3RFdnQ6d2hlbj0iMjAyNi0wMS0xMlQyMzo1ODoyNyswNjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjMgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplMmU0NDI4Mi1lZGEzLWVjNGEtOTNlMy0zYzIwZmY5ZTdjMWUiIHN0RXZ0OndoZW49IjIwMjYtMDEtMTlUMTM6MDY6MjArMDY6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4zIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7rjTZpAABSQElEQVR4nO29d3wdxbn//57dPU1dLnLBgG2IGx0Dxg42tulcSnDooQQSAiSQ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3Ny8+0033cS0adN6BSgmT57MP/7xD4455pj3YrHYDShP3nRA8oNGEGdBwP+B1FtiSCFJTwwJiDwgcxpN71YXsFErUlvT2BXVOHv+GJT4sYW8+GGmIHv1u1bN9mc5xzwClTGshj1BiF+gQCZK3r5uouqkv/31ZRYu/JghQ4YA2p05osL5SYkUELEjxGJJUx79WsSKntDll19OOp3mkksumRKPx99Beb6aXFW0O2sfXNfN6W564o2qnN0kQMXnn3/Odddd2+28epsM0ydlTLyAahMPTB1g2LJly/rfcMOvufvuu3qlbOeffz7XXnstffv2/Rtq46tW1JhIUiiqm96vGij0mClbBNEV6oqKsdqBv2uuwVgWgtqnA3XBUHrioty0OyRWu4t98N2IqkGfoXwGTJQMagjTi2Mzln2dNerwQ1COW2+inK6CgEICIzdu3MgNN9xAv379vWjTGYRlYYl8GGDU/iDEU3HT7NaVzuLfgmbMmEEmk+Hyyy8fH4/H56GicudEESFESaH0TVIDSfsm9Kx8FRUJ0ul038cff1wHjPm3IE8nk3ZdN5JKleeUlUgk2G67IQC1ixcvrjr33HN56623eqVc99xzD6eccgoVFRVPovp3G3mu25xMzXFj6jCC9BZQYr/tKWcRDCCSvBd6zvIhya0a00+6KMcp6SC2pLCHHoI9IqfUNPca9W9SbLoB69wslMlwMYVuvH6QAMUe7vfQQw+xpaWFQQMHknVdYraFsGyvtALLc7CJxGLEUillqSmnHXqBampqaW1t7eZSabVa1bIEP//5ZWPj8fgCVBBgbRUpmzsw7+/JMpdoNMLAgQNZuXIlTz75VPcz+grIW48RsW2LWKw837VMJsOKFSt49913qy655BI2b97c4/JEo1GeeuopDj/8cCzL+iOwkEJRPGkcgybVrqwiBBw7UU+cskJldSmVCCItco5WmD4W3j1YIGwLtmXV5mSTb0LEEpBf/+FPurJB8Rn1UQNHULAU/fsun37yCX+a9RD9+/UnEo3iuFmP+xG5KVMIgetxFtFYFNvqpLP4SikajfLII4+w77778t3vnsmcOXO6lc/VV19DJpNh+vQrd4vH45+ifFYcgFisvMWVyvfEWy/YA85C7bERIR6P89lnn3U/o6+AmpubkFLiOBEqKiq7fsCgVatWcd5557F+/fpuRz43aeedd2b2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yp2klCOklKOklGOklLtIKXeTUu4updxDSrmnlHIvL+1tpLG9nMy89/Leu4dXll29so3yyrqTV/YdpJTbSSkHSin7Syn7SCnrpJQ1XjLrPtCr93Avnz2klOOklJOllEdKKe+7+eabcyC1fv16KaV8Xkp5rZTyFinl21LK56SUHz322GN+pVsuPf/881JK+datt96au3bVVVd1uu+pp56SUsp0PB6XgNxrr73kSSedVHBPfX29lFK2SynvXbRokdxtt91yv02aNCl3fu6558pNmzZJKeWi22+/PbBcV155ZWiZKyoqpJQyLaW8VUp5m5QyWVNTk3uPlHLdhRdeKAE5depUCch99tlHSimbpZSrzjjjDAnIE044QS5ZsiSX76xZs+QhhxwS+t65c+fKdDqd+/+kk06S48ePL7hn//33l1LKDVLKe6WU90gpZ23YsCH3+/Tp06WU8gMp5V1SyjullHdIKefeeOONuXuWLFkipZQPSClfuvfeeyUg//SnP0kpZWjZALlo0aLc+XXXXSellK9LKW9dv369BORRRx0lpZQrjjvuuNx9N910U+78t7/9rZw3b56srKyUgEwkEnLvvffO/f6b3/xGJpNJKaX8lpRyqpRyvNfvR3v9e7DXd2ullJVSjW1HqjEvpA8TShFD/DKMX54KmqW1csYvbpSjn/iq9BX+MvtFEj+XEXSu89LTVjGuIsgph5aWFhoaGpagRJxmlI+KDfzXSSedBKiZcdq0aQDcdttttLW1cfLJJ9PS0rKvnm0B5s+fz8UXX4xlWSxZsoTZs2fz+OOPM2HCBKd///6sXLmSdevWse++++bC0d11111IKXn44Yfjp5566l5/+MMfWLBgAQDTp09nxowZHH300bz44ovceeednHTSSUyZMmXM+eefD8Cee+6Zm8mklKxatYpLLrkk9/6jjz6a0aNHA0pXgAowq2XpBZdeeunYK67IuZdLvVbkT3/6E7fddhv33nsvTz75ZO20adM2698ee+yxgjiiyWSS733ve+y5557ceOONDBgwAK3MBCUumJ6oH330EVOnTmXixIlks1luvvlmNmzYwIsvvtj/8MMPH4AStwr8uz13+wRwgC4rsMn07DSCAWX0d/F+n3f11VeP/eKLL7j//vvZb7/9mDx5MkDOL0KTx0llAKk5G88dPmXGvbjoooty3/DQQw/lggsu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" alt="">
          </div>
          <h2 style="margin-bottom: 24px; margin-left:8px">Nick Electro Co.</h2>
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
      //background: #f8f9fa;
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
    .status-filters {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .status-filter-btn {
      border: 1px solid #d9d9d9;
      background: #fff;
      color: #555;
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .status-filter-btn.active {
      border-color: #667eea;
      background: #667eea;
      color: #fff;
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
      gap: 6px;
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
      gap: 2px;
      flex-wrap: wrap;
    }

    .badge {
      background: #e8eaf6;
      color: #667eea;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge.status {
      background: #e9f7ef;
      color: #27ae60;
    }
    .badge.status.inactive {
      background: #fef2f2;
      color: #e74c3c;
    }

    .sale-details {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f79600;
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
    .sale-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .btn-action {
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      cursor: pointer;
    }
    .btn-edit {
      background: #3498db;
    }
    .btn-status {
      background: #f39c12;
    }
    .btn-delete {
      background: #e74c3c;
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
    .confirm-modal-content {
      background: white;
      width: 100%;
      border-radius: 16px 16px 0 0;
      padding: 20px 16px;
      animation: slideUp 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .confirm-actions {
      display: flex;
      gap: 10px;
      margin-top: 4px;
    }
    .btn-cancel,
    .btn-confirm {
      flex: 1;
      border: none;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-cancel {
      background: #f1f1f1;
      color: #444;
    }
    .btn-confirm {
      background: #667eea;
      color: #fff;
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
  selectedStatus: 'delivered' | 'pending' = 'delivered';
  isLoading = false;
  selectedSale: Sale | null = null;
  temp: any;
    lastSaleItems: any[] = [];
  lastSubtotal = 0;
  lastDiscount = 0;
  lastTotal = 0;
  currentDate : any;
  resaleer:any=''
  popupMode: 'delete' | 'status' | null = null;
  popupSale: Sale | null = null;
  nextStatus = 'inactive';
  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private sunmiPrinterService: SunmiPrinterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }
  async printReceipt(): Promise<void> {
    const printElement = document.getElementById('print-receipt');
    const printContents = printElement?.innerHTML;
    if (!printContents) {

      return;
    }

    const plainReceiptText = this.buildAlignedReceiptText58mm();

    const printedByNativePrinter = await this.sunmiPrinterService.printText(plainReceiptText);
    console.log('print',)
    if (printedByNativePrinter) {

      return;
    }
    console.log('native',this.sunmiPrinterService.isNativeAndroid())
    if (this.sunmiPrinterService.isNativeAndroid()) {
      this.downloadReceiptFiles(plainReceiptText);
      this.notificationService.warning('Printer unavailable. Receipt downloaded.');
      return;
    }

    const printDocument = `
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
      `;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      document.body.removeChild(printFrame);
      this.notificationService.error('Unable to prepare printer');
      return;
    }

    frameDoc.open();
    frameDoc.write(printDocument);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 300);
  }

  private downloadReceiptFiles(receiptText: string): void {
    const timestamp = this.getFileTimestamp();
    const baseName = `receipt-${timestamp}`;
    this.downloadTextFile(`${baseName}.txt`, receiptText);
    this.downloadPdfFile(`${baseName}.pdf`, receiptText);
  }

  private downloadTextFile(fileName: string, text: string): void {
    const blob = new Blob([text.endsWith('\n') ? text : `${text}\n`], {
      type: 'text/plain;charset=utf-8'
    });
    this.triggerDownload(blob, fileName);
  }

  private downloadPdfFile(fileName: string, text: string): void {
    const pageWidthMm = 80;
    const marginMm = 3;
    const lineHeightMm = 3.8;
    const fontSize = 8.5;
    const lines = text.split('\n');

    const pageHeightMm = Math.max(40, marginMm * 2 + lines.length * lineHeightMm + 4);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageWidthMm, pageHeightMm]
    });
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(fontSize);

    let y = marginMm + lineHeightMm;
    for (const line of lines) {
      pdf.text(line, marginMm, y);
      y += lineHeightMm;
    }

    const blob = pdf.output('blob');
    this.triggerDownload(blob, fileName);
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  private getFileTimestamp(): string {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }

  private buildAlignedReceiptText58mm(): string {
    const lineWidth = 38;
    const hr = '-'.repeat(lineWidth);
    const items = (this.selectedSale?.items || this.lastSaleItems || []) as Array<any>;
    const buyer = (this.resaleer || this.selectedSale?.sold_to || 'Retail Customer').toString();
    const address = (this.selectedSale?.resaler_address || '-').toString();
    const phone = (this.selectedSale?.resaler_phone || '-').toString();
    const saleDate = this.selectedSale?.created_at || this.currentDate || new Date().toISOString();
    const deliveryDate = this.selectedSale?.updated_at || saleDate;

    const subtotal = this.lastSubtotal || ((this.selectedSale?.sale_price || 0) + (this.selectedSale?.discount || 0));
    const discount = this.lastDiscount || (this.selectedSale?.discount || 0);
    const total = this.lastTotal || (this.selectedSale?.sale_price || 0);

    const lines: string[] = [];
    lines.push('.');
    lines.push(this.centerText('Nick Electro Co.', lineWidth));
    lines.push(this.centerText('Sales Receipt', lineWidth));
    lines.push(hr);
    lines.push(`Buyer: ${buyer}`);
    lines.push(`Address: ${address}`);
    lines.push(`Phone: ${phone}`);
    lines.push(`Order Date: ${this.formatDateTimeForReceipt(saleDate)}`);
    lines.push(`Delivery : ${this.formatDateTimeForReceipt(deliveryDate)}`);
    lines.push(hr);
    lines.push(this.padRight('Item', 16) + this.padLeft('Qty', 4) + this.padLeft('Rate', 6) + this.padLeft('Fr', 4) + this.padLeft('Amt', 8));
    lines.push(hr);

    for (const item of items) {
      const name = (item?.name || item?.product_name || 'Item').toString().trim();
      const qty = Number(item?.quantity || 0);
      const freeQty = Number(item?.free_item || 0);
      const rate = Number(item?.sale_price || item?.price || 0);
      const amount = qty * rate;
      const wrappedName = this.wrapTextByWidth(name, 16);

      wrappedName.forEach((part, idx) => {
        if (idx === 0) {
          lines.push(
            this.padRight(part, 16) +
            this.padLeft(String(qty), 4) +
            this.padLeft(this.formatCompactMoney(rate), 6) +
            this.padLeft(String(freeQty), 4) +
            this.padLeft(this.formatCompactMoney(amount), 8)
          );
        } else {
          lines.push(this.padRight(part, 16));
        }
      });
      lines.push(hr);
    }

    lines.push(this.padRight('Subtotal', 24) + this.padLeft(this.formatCompactMoney(subtotal), 14));
    lines.push(this.padRight('Discount', 24) + this.padLeft(this.formatCompactMoney(discount), 14));
    lines.push(this.padRight('Total', 24) + this.padLeft(this.formatCompactMoney(total), 14));
    lines.push(hr);
    lines.push(this.centerText('Thank you', lineWidth));
    lines.push('.');
    lines.push('');
    lines.push('');
    return lines.join('\n');
  }

  private wrapTextByWidth(text: string, width: number): string[] {
    if (!text) {
      return [''];
    }
    const words = text.split(/\s+/).filter(Boolean);
    if (!words.length) {
      return [''];
    }

    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if (!current) {
        current = word;
      } else if (`${current} ${word}`.length <= width) {
        current = `${current} ${word}`;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) {
      lines.push(current);
    }
    return lines;
  }

  private centerText(text: string, width: number): string {
    const cleaned = text.slice(0, width);
    const left = Math.max(0, Math.floor((width - cleaned.length) / 2));
    return `${' '.repeat(left)}${cleaned}`;
  }

  private padRight(text: string, width: number): string {
    return text.length >= width ? text.slice(0, width) : text + ' '.repeat(width - text.length);
  }

  private padLeft(text: string, width: number): string {
    return text.length >= width ? text.slice(text.length - width) : ' '.repeat(width - text.length) + text;
  }

  private formatCompactMoney(value: number): string {
    return Number(value || 0).toFixed(0);
  }

  private formatDateTimeForReceipt(input: any): string {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  private loadSales(): void {
    this.isLoading = true;
    this.apiService.getSalesHistory().subscribe({
      next: (data) => {
        this.temp = data;
        this.sales = this.temp?.data ?? [];
        this.filteredSales = this.temp?.data ?? [];
        console.log('Loaded sales:', data);
        this.isLoading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        //this.notificationService.error('Failed to load sales data');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterSales(): void {
    this.isLoading = false;
    console.log('Filtering sales from:', this.dateFrom, 'to:', this.dateTo);
    this.filteredSales = this.sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      saleDate.setHours(0, 0, 0, 0); // Normalize to start of day
      const fromDate = this.dateFrom ? new Date(this.dateFrom) : null;
      const toDate = this.dateTo ? new Date(this.dateTo) : null;
      const normalizedStatus = this.getSaleStatus(sale);
      console.log('Sale date:', fromDate && saleDate < fromDate, 'From date:', toDate && saleDate > toDate, 'Sale:', saleDate);
      if (fromDate && saleDate < fromDate) {
        return false;
      }
      if (toDate && saleDate > toDate) {
        return false;
      }
      if (this.selectedStatus && normalizedStatus !== this.selectedStatus) {
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

  setStatusFilter(status: 'delivered' | 'pending'): void {
    this.selectedStatus = status;
    this.filterSales();
  }

  getSaleStatus(sale: Sale): 'delivered' | 'pending' {
    const status = ((sale as any)?.status || '').toString().toLowerCase().trim();
    return status === 'delivered' ? 'delivered' : 'pending';
  }

  getSaleSubtotal(sale: Sale | null): number {
    if (!sale) {
      return 0;
    }
    return Number(sale.sale_price || 0) + Number(sale.discount || 0);
  }

  editSale(sale: Sale): void {
    const editPayload = {
      id: sale.id,
      sold_to: sale.sold_to || '',
      resaler_address: sale.resaler_address || '',
      resaler_phone: sale.resaler_phone || '',
      resaler_google_location: (sale as any).resaler_google_location || '',
      discount: sale.discount || 0,
      sale_price: sale.sale_price || 0,
      items: (sale.items || []).map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        free_item: item.free_item || 0,
        sale_price: item.sale_price || item.price || 0,
        name: item.name || item.product_name || ''
      }))
    };
    localStorage.setItem('pos_edit_sale', JSON.stringify(editPayload));
    this.router.navigate(['/pos'], { queryParams: { editSaleId: sale.id } });
  }

  openStatusPopup(sale: Sale): void {
    this.popupSale = sale;
    this.popupMode = 'status';
    this.nextStatus = this.getSaleStatus(sale) === 'pending' ? 'delivered' : 'pending';
  }

  openDeletePopup(sale: Sale): void {
    this.popupSale = sale;
    this.popupMode = 'delete';
  }

  closeActionPopup(): void {
    this.popupMode = null;
    this.popupSale = null;
    this.nextStatus = 'delivered';
  }

  confirmAction(): void {
    if (!this.popupSale || !this.popupMode) {
      return;
    }

    if (this.popupMode === 'delete') {
      this.apiService.deleteSale(this.popupSale.id).subscribe({
        next: () => {
 
          //this.notificationService.success('Sale deleted');
          this.closeActionPopup();
          this.loadSales();
        },
        error: (error) => {
          const message = error?.error?.message || 'Failed to delete sale';
          this.notificationService.error(message);
        }
      });
      return;
    }

    this.apiService.updateSaleStatus(this.popupSale.id, this.nextStatus).subscribe({
      next: () => {

        //this.notificationService.success('Sale status updated');
        this.closeActionPopup();
        this.loadSales();
      },
      error: (error) => {
        const message = error?.error?.message || 'Failed to update sale status';
        this.notificationService.error(message);
      }
    });
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


