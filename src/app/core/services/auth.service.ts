import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Customer, AuthState } from '../models/auth.model';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    token: null,
    customer: null,
    isAuthenticated: false,
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient,
  @Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = null;
    const customer = null;
    if (token && customer) {
      this.authStateSubject.next({
        token,
        customer,
        isAuthenticated: true
      });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/customer/login`, credentials).pipe(
      tap(response => {
        if (response.success) {
            console.log('Login successful:', response.data.token);
          this.storeToken(response.data.token);
          this.storeCustomer(response.data.customer);
          this.authStateSubject.next({
            token: response.data.token,
            customer: response.data .customer,
            isAuthenticated: true
          });
        }
      })
    );
  }

  logout(): void {
    this.clearAuth();
    this.authStateSubject.next({
      token: null,
      customer: null,
      isAuthenticated: false
    });
  }

  getToken(): string | null {
    return this.getStoredToken();
  }

  getCustomer(): Customer | null {
    return this.getStoredCustomer();
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

private storeToken(token: string): void {
  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem('auth_token', token);
  }
}
private getStoredToken(): string | null {
  if (isPlatformBrowser(this.platformId)) {
    return localStorage.getItem('auth_token');
  }
  return null;
}

private storeCustomer(customer: Customer): void {
  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem('customer_data', JSON.stringify(customer));
  }
}

private getStoredCustomer(): Customer | null {
  if (isPlatformBrowser(this.platformId)) {
    const data = localStorage.getItem('customer_data');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

private clearAuth(): void {
  if (isPlatformBrowser(this.platformId)) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer_data');
  }
}

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/customer/change-password`, {
      old_password: oldPassword,
      new_password: newPassword
    });
  }
}
