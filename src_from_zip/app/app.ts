import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { BottomNavComponent } from './shared/components/bottom-nav.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { LocationService } from './core/services/location.service';
import { Router } from '@angular/router';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    ToastContainerComponent,
    BottomNavComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
      <app-bottom-nav></app-bottom-nav>
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f8f9fa;
    }
  `]
})
export class App implements OnInit {
  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.enforceLocationPermission();
    }

    this.authService.authState$.subscribe(authState => {
      if (authState.isAuthenticated) {
        this.enforceLocationPermission();
      } else {
        this.locationService.stopTracking();
      }
    });
  }

  private async enforceLocationPermission(): Promise<void> {
    const hasLocationPermission = await this.locationService.ensurePermissionAndStartTracking();
    if (!hasLocationPermission) {
      this.locationService.stopTracking();
      this.authService.logout();
      this.notificationService.error('Location permission is required to use this app.');
      this.router.navigate(['/auth/login']);
    }
  }
}
