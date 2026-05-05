import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {
  Product,
  Sale,
  DashboardStats,
  SalesChartData,
  LocationData,
  ApiResponse
} from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
    headers  :any 
  constructor(private http: HttpClient, private authService: AuthService) {
    
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });
  }

  // Dashboard endpoints
  getDashboardStats(): Observable<DashboardStats> {
     this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
    });
    return this.http.get<DashboardStats>(`${environment.apiUrl}/customer/dashboard`,{ headers: this.headers });
  }

  getSalesChart(): Observable<SalesChartData[]> {
    this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
    });
    return this.http.get<SalesChartData[]>(`${environment.apiUrl}/customer/sales-chart`, { headers: this.headers });
  }

  // Stock endpoints
  getCustomerStocks(search?: string, category?: string): Observable<Product[]> {
    this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
    });
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<Product[]>(`${environment.apiUrl}/customer/stock`, { params, headers: this.headers });
  }

  getProductById(id: number): Observable<Product> {
    this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
    });
    return this.http.get<Product>(`${environment.apiUrl}/customer/stock/${id}`, { headers: this.headers });
  }

  getStockCategories(): Observable<string[]> {
    this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
    });
    return this.http.get<string[]>(`${environment.apiUrl}/customer/stock-categories`, { headers: this.headers });
  }

  // POS endpoints
  processSale(data: {
    items: Array<{  quantity: number; free_item?: number; sale_price?: number; name?: string }>;
    discount: number;
    payment_method: string;
    sold_to?: string;
    sold_to_address?: string;
    sold_to_phone?: string;
  }): Observable<Sale> {
    this.headers = this.getAuthHeaders();
    const normalizedPayload = {
      ...data,
      items: (data.items || []).map(item => ({
        product_id:1,
        quantity: item.quantity,
        free_item: item.free_item ?? 0,
        sale_price: item.sale_price,
        name: item.name
      }))
    };

    return this.http.post<Sale>(`${environment.apiUrl}/customer/sale`, normalizedPayload, { headers: this.headers }).pipe(
      catchError(() =>
        this.http.post<Sale>(`${environment.apiUrl}/customer/sales`, normalizedPayload, { headers: this.headers })
      ),
      catchError(() =>
        this.http.post<Sale>(`${environment.apiUrl}/customer/pos/sell`, normalizedPayload, { headers: this.headers })
      )
    );
  }

  updateSale(id: number, data: any): Observable<Sale> {
    const headers = this.getAuthHeaders();
    return this.http.put<Sale>(`${environment.apiUrl}/customer/sale/${id}`, data, { headers }).pipe(
      catchError(() =>
        this.http.post<Sale>(`${environment.apiUrl}/customer/sale/${id}/update`, data, { headers })
      )
    );
  }

  updateSaleStatus(id: number, status: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${environment.apiUrl}/customer/sale/${id}/status`, { status }, { headers }).pipe(
      catchError(() =>
        this.http.put(`${environment.apiUrl}/customer/sale/${id}`, { status }, { headers })
      ),
      catchError(() =>
        this.http.post(`${environment.apiUrl}/customer/sale/${id}/status`, { status }, { headers })
      )
    );
  }

  deleteSale(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${environment.apiUrl}/customer/sale/${id}`, { headers }).pipe(
      catchError((error) => {
        if (error?.status === 404) {
          return this.http.post(`${environment.apiUrl}/customer/sale/${id}/delete`, {}, { headers });
        }
        return throwError(() => error);
      })
    );
  }

  // Sales endpoints
  getSalesHistory(dateFrom?: string, dateTo?: string): Observable<Sale[]> {
    let params = new HttpParams();
    if (dateFrom) {
      params = params.set('date_from', dateFrom);
    }
    if (dateTo) {
      params = params.set('date_to', dateTo);
    }
    this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
    });
    return this.http.get<Sale[]>(`${environment.apiUrl}/customer/sales-history`, { params, headers: this.headers });
  }

  getSaleDetails(id: number): Observable<Sale> {
    this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
    });
    return this.http.get<Sale>(`${environment.apiUrl}/customer/sale/${id}`, { headers: this.headers });
  }

  // Reports endpoints
  getDailySalesReport(date: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/customer/reports/daily`, {
      params: { date }
    });
  }

  getWeeklySalesReport(weekStartDate: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/customer/reports/weekly`, {
      params: { week_start: weekStartDate }
    });
  }

  getMonthlySalesReport(year: number, month: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/customer/reports/monthly`, {
      params: { year, month }
    });
  }

  getProfitReport(dateFrom: string, dateTo: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/customer/reports/profit`, {
      params: { date_from: dateFrom, date_to: dateTo }
    });
  }

  getAppReport(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${environment.apiUrl}/customer/app-report`, { headers });
  }

  // Location endpoints
  trackLocation(location: LocationData): Observable<any> {
       this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
    });
    return this.http.post(`${environment.apiUrl}/customer/location/update`, location, { headers: this.headers } );
  }

  // Profile endpoints
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/customer/profile`, data);
  }
}
