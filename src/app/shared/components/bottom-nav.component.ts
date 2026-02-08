import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bottom-nav">
      <a
        *ngFor="let item of navItems"
        [routerLink]="item.route"
        class="nav-item"
        [class.active]="isActive(item.route)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
        <span *ngIf="item.badge" class="nav-badge">{{ item.badge }}</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      background: white;
      border-top: 1px solid #e0e0e0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
      height: 70px;
      z-index: 100;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-decoration: none;
      color: #999;
      transition: all 0.3s ease;
      position: relative;
      gap: 4px;
    }

    .nav-item:active,
    .nav-item.active {
      color: #667eea;
    }

    .nav-icon {
      font-size: 24px;
      font-weight: 500;
    }

    .nav-label {
      font-size: 11px;
      font-weight: 500;
    }

    .nav-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: #e74c3c;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
    }

    @media (max-width: 480px) {
      .bottom-nav {
        height: 60px;
      }

      .nav-icon {
        font-size: 20px;
      }

      .nav-label {
        font-size: 10px;
      }
    }
  `]
})
export class BottomNavComponent implements OnInit {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Stock', icon: '📦', route: '/stock' },
    { label: 'POS', icon: '🛒', route: '/pos' },
    { label: 'Sales', icon: '📈', route: '/sales' },
    { label: 'Profile', icon: '👤', route: '/profile' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
