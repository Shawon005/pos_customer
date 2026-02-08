import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { BottomNavComponent } from './shared/components/bottom-nav.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { LocationService } from './core/services/location.service';

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
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    // Initialize location tracking if authenticated
    if (this.authService.isAuthenticated()) {
      this.locationService.requestPermissionAndStartTracking();
    }

    // Subscribe to auth changes to manage location tracking
    this.authService.authState$.subscribe(authState => {
      if (authState.isAuthenticated) {
        this.locationService.requestPermissionAndStartTracking();
      } else {
        this.locationService.stopTracking();
      }
    });
  }
}
