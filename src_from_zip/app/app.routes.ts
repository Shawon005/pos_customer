import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/components/login.component';
import { DashboardComponent } from './features/dashboard/components/dashboard.component';
import { StockComponent } from './features/stock/components/stock.component';
import { POSComponent } from './features/pos/components/pos.component';
import { SalesComponent } from './features/sales/components/sales.component';
import { ReportsComponent } from './features/reports/components/reports.component';
import { ProfileComponent } from './features/profile/components/profile.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'stock',
    component: StockComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pos',
    component: POSComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sales',
    component: SalesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
