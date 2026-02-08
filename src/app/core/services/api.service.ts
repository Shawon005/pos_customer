import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    items: Array<{ product_id: number; quantity: number }>;
    discount: number;
    payment_method: string;
  }): Observable<Sale> {
    this.headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json'
    });
    return this.http.post<Sale>(`${environment.apiUrl}/customer/sell`, data, { headers: this.headers });
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
