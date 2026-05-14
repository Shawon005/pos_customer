import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ShopOwner } from '../models/shop-owner.model';

@Injectable({
  providedIn: 'root'
})
export class ShopOwnerService {
  constructor(private authService: AuthService) {}

  getAll(): ShopOwner[] {
    return this.readOwners();
  }

  save(owner: Omit<ShopOwner, 'id' | 'createdAt' | 'updatedAt'>): ShopOwner {
    const now = new Date().toISOString();
    const newOwner: ShopOwner = {
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      ...owner
    };

    const owners = this.readOwners();
    owners.unshift(newOwner);
    this.writeOwners(owners);
    return newOwner;
  }

  update(id: string, owner: Omit<ShopOwner, 'id' | 'createdAt' | 'updatedAt'>): ShopOwner | null {
    const owners = this.readOwners();
    const index = owners.findIndex(item => item.id === id);
    if (index === -1) return null;

    const updated: ShopOwner = {
      ...owners[index],
      ...owner,
      updatedAt: new Date().toISOString()
    };
    owners[index] = updated;
    this.writeOwners(owners);
    return updated;
  }

  remove(id: string): void {
    const owners = this.readOwners().filter(item => item.id !== id);
    this.writeOwners(owners);
  }

  private getStorageKey(): string {
    const customer = this.authService.getCustomer();
    const customerId = customer?.id ?? 'guest';
    return `shop_owners_customer_${customerId}`;
  }

  private readOwners(): ShopOwner[] {
    const raw = localStorage.getItem(this.getStorageKey());
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeOwners(owners: ShopOwner[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(owners));
  }

  private generateId(): string {
    return `owner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

