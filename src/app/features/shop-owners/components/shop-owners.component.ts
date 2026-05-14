import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopOwner } from '../../../core/models/shop-owner.model';
import { ShopOwnerService } from '../../../core/services/shop-owner.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-shop-owners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shop-owner-page">
      <header class="page-header">
        <h1>Shop Owners</h1>
      </header>

      <form class="owner-form" (ngSubmit)="saveOwner()">
        <input type="text" [(ngModel)]="form.name" name="name" placeholder="Shop Owner Name" required />
        <input type="text" [(ngModel)]="form.address" name="address" placeholder="Address" />
        <input type="text" [(ngModel)]="form.phone" name="phone" placeholder="Phone" />
        <input type="text" [(ngModel)]="form.googleLocation" name="googleLocation" placeholder="Google Location Link / Map URL" />

        <div class="actions">
          <button type="button" class="btn-secondary" (click)="resetForm()" *ngIf="editingId">Cancel Edit</button>
          <button type="submit" class="btn-primary">{{ editingId ? 'Update Owner' : 'Save Owner' }}</button>
        </div>
      </form>

      <div class="owner-list">
        <div class="owner-card" *ngFor="let owner of owners">
          <h3>{{ owner.name }}</h3>
          <p><strong>Phone:</strong> {{ owner.phone || '-' }}</p>
          <p><strong>Address:</strong> {{ owner.address || '-' }}</p>
          <p><strong>Google Location:</strong> {{ owner.googleLocation || '-' }}</p>
          <div class="card-actions">
            <button class="btn-edit" (click)="startEdit(owner)">Edit</button>
            <button class="btn-delete" (click)="deleteOwner(owner.id)">Delete</button>
          </div>
        </div>
        <div class="empty" *ngIf="owners.length === 0">No shop owners added yet.</div>
      </div>
    </div>
  `,
  styles: [`
    .shop-owner-page { padding: 16px; padding-bottom: 90px; margin-bottom: 60px; min-height: 100vh; background: #f8f9fa; }
    .page-header { margin-bottom: 16px; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #333; }
    .owner-form { background: #fff; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
    .owner-form input { border: 1px solid #e0e0e0; border-radius: 6px; padding: 10px 12px; }
    .actions { display: flex; gap: 8px; }
    .btn-primary, .btn-secondary { border: none; border-radius: 6px; padding: 10px 12px; font-weight: 600; cursor: pointer; }
    .btn-primary { background: #667eea; color: #fff; flex: 1; }
    .btn-secondary { background: #f0f0f0; color: #333; }
    .owner-list { display: flex; flex-direction: column; gap: 10px; }
    .owner-card { background: #fff; border-radius: 10px; padding: 12px; }
    .owner-card h3 { margin: 0 0 8px 0; }
    .owner-card p { margin: 4px 0; font-size: 13px; color: #444; word-break: break-word; }
    .card-actions { margin-top: 10px; display: flex; gap: 8px; }
    .btn-edit, .btn-delete { border: none; border-radius: 6px; padding: 8px 10px; color: #fff; cursor: pointer; font-size: 12px; font-weight: 600; }
    .btn-edit { background: #3498db; }
    .btn-delete { background: #e74c3c; }
    .empty { text-align: center; background: #fff; border-radius: 10px; padding: 16px; color: #777; }
  `]
})
export class ShopOwnersComponent implements OnInit {
  owners: ShopOwner[] = [];
  editingId: string | null = null;
  form = {
    name: '',
    address: '',
    phone: '',
    googleLocation: ''
  };

  constructor(
    private shopOwnerService: ShopOwnerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOwners();
  }

  saveOwner(): void {
    if (!this.form.name.trim()) {
      this.notificationService.warning('Owner name is required');
      return;
    }

    if (this.editingId) {
      this.shopOwnerService.update(this.editingId, this.form);
      this.notificationService.success('Shop owner updated');
    } else {
      this.shopOwnerService.save(this.form);
      this.notificationService.success('Shop owner saved');
    }

    this.resetForm();
    this.loadOwners();
  }

  startEdit(owner: ShopOwner): void {
    this.editingId = owner.id;
    this.form = {
      name: owner.name || '',
      address: owner.address || '',
      phone: owner.phone || '',
      googleLocation: owner.googleLocation || ''
    };
  }

  deleteOwner(id: string): void {
    this.shopOwnerService.remove(id);
    this.loadOwners();
    this.notificationService.success('Shop owner deleted');
  }

  resetForm(): void {
    this.editingId = null;
    this.form = { name: '', address: '', phone: '', googleLocation: '' };
  }

  private loadOwners(): void {
    this.owners = this.shopOwnerService.getAll();
  }
}

