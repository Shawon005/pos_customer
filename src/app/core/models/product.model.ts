export interface Product {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  image_url?: string;
  category: string;
  quantity: number;
  cost_price: number;
  purchase_price: number;
  min_stock: number;
  created_at: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T; // This 'T' will be your Product or DashboardStats
}
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  invoice_number: string;
  customer_id: number;
  total_amount: number;
  discount: number;
  profit: number;
  sale_price: number;
  items: SaleItem[];
  quantity: number;
  created_at: string;
}

export interface SaleItem {
  id: number;
  product_id: number;
  product_name: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  sale_price: number; 
}

export interface DashboardStats {
  total_stock_items: number;
  today_sales_count: number;
  total_stock_value: number;
  low_stock_count: number;
  today_sales: number;
}

export interface SalesChartData {
  date: string;
  sales: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
}
