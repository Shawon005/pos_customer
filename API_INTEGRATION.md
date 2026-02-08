# POS Customer - API Integration Guide

This guide outlines all required Laravel REST API endpoints for the POS Customer Angular application.

## 🔐 Authentication

### POST /login
Login endpoint for customer authentication.

**Request:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "customer@example.com",
    "phone": "01712345678",
    "address": "123 Main St, City",
    "credit_limit": 50000,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Status Codes:**
- 200: Login successful
- 401: Invalid credentials
- 422: Validation error

---

## 📊 Dashboard Endpoints

### GET /customer/dashboard
Get dashboard statistics (requires auth).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_stock_items": 150,
  "total_sales_today": 25000.50,
  "total_profit_today": 5000.25,
  "low_stock_count": 5
}
```

---

### GET /customer/sales-chart
Get sales data for the last 7 days (requires auth).

**Query Parameters:**
- `days` (optional): Number of days to retrieve (default: 7)

**Response:**
```json
[
  {
    "date": "2025-01-15",
    "sales": 15000
  },
  {
    "date": "2025-01-16",
    "sales": 22500
  }
]
```

---

## 📦 Stock/Inventory Endpoints

### GET /customer/stocks
Get customer's assigned products (requires auth).

**Query Parameters:**
- `search` (optional): Search by product name or SKU
- `category` (optional): Filter by category
- `page` (optional): Pagination page number

**Example:**
```
GET /customer/stocks?search=laptop&category=Electronics&page=1
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Dell Laptop",
    "sku": "SKU-001",
    "image_url": "https://example.com/image.jpg",
    "category": "Electronics",
    "quantity": 50,
    "cost_price": 30000,
    "sell_price": 45000,
    "min_stock": 10,
    "created_at": "2025-01-10T08:00:00Z"
  }
]
```

---

### GET /customer/stock-categories
Get available product categories (requires auth).

**Response:**
```json
[
  "Electronics",
  "Clothing",
  "Food & Beverages",
  "Home & Garden",
  "Sports"
]
```

---

### GET /customer/stocks/:id
Get specific product details (requires auth).

**Response:**
```json
{
  "id": 1,
  "name": "Dell Laptop",
  "sku": "SKU-001",
  "image_url": "https://example.com/image.jpg",
  "category": "Electronics",
  "quantity": 50,
  "cost_price": 30000,
  "sell_price": 45000,
  "min_stock": 10,
  "created_at": "2025-01-10T08:00:00Z"
}
```

---

## 🛒 Point of Sale (POS) Endpoints

### POST /customer/pos/sell
Process a sale transaction (requires auth).

**Request:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 5,
      "quantity": 1
    }
  ],
  "discount": 500,
  "payment_method": "cash"
}
```

**Response (Success):**
```json
{
  "id": 50,
  "invoice_number": "INV-2025-050",
  "customer_id": 1,
  "total_amount": 89500,
  "discount": 500,
  "profit": 19500,
  "items": [
    {
      "id": 101,
      "product_id": 1,
      "product_name": "Dell Laptop",
      "quantity": 2,
      "price": 45000,
      "subtotal": 90000
    },
    {
      "id": 102,
      "product_id": 5,
      "product_name": "USB Mouse",
      "quantity": 1,
      "price": 500,
      "subtotal": 500
    }
  ],
  "created_at": "2025-01-16T14:30:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Insufficient stock for product ID 1"
}
```

**Status Codes:**
- 200: Sale processed successfully
- 400: Insufficient stock or invalid data
- 422: Validation error

---

## 📋 Sales History Endpoints

### GET /customer/sales
Get sales history (requires auth).

**Query Parameters:**
- `date_from` (optional): Start date (format: YYYY-MM-DD)
- `date_to` (optional): End date (format: YYYY-MM-DD)
- `page` (optional): Pagination page

**Example:**
```
GET /customer/sales?date_from=2025-01-01&date_to=2025-01-31
```

**Response:**
```json
[
  {
    "id": 50,
    "invoice_number": "INV-2025-050",
    "customer_id": 1,
    "total_amount": 89500,
    "discount": 500,
    "profit": 19500,
    "items": [
      {
        "id": 101,
        "product_id": 1,
        "product_name": "Dell Laptop",
        "quantity": 2,
        "price": 45000,
        "subtotal": 90000
      }
    ],
    "created_at": "2025-01-16T14:30:00Z"
  }
]
```

---

### GET /customer/sales/:id
Get specific sale details (requires auth).

**Response:**
Same as individual sale object from sales list.

---

## 📊 Reports Endpoints

### GET /customer/reports/daily
Get daily sales report (requires auth).

**Query Parameters:**
- `date` (required): Report date (format: YYYY-MM-DD)

**Example:**
```
GET /customer/reports/daily?date=2025-01-16
```

**Response:**
```json
{
  "date": "2025-01-16",
  "total_sales": 150000,
  "total_profit": 30000,
  "transaction_count": 25,
  "items_sold": 85,
  "top_products": [
    {
      "product_id": 1,
      "product_name": "Dell Laptop",
      "quantity": 10,
      "revenue": 450000
    }
  ]
}
```

---

### GET /customer/reports/weekly
Get weekly sales report (requires auth).

**Query Parameters:**
- `week_start` (required): Week start date (format: YYYY-MM-DD)

**Response:**
```json
{
  "week_start": "2025-01-12",
  "week_end": "2025-01-18",
  "total_sales": 850000,
  "total_profit": 170000,
  "daily_breakdown": [
    {
      "date": "2025-01-12",
      "sales": 120000
    }
  ]
}
```

---

### GET /customer/reports/monthly
Get monthly sales report (requires auth).

**Query Parameters:**
- `year` (required): Year (format: YYYY)
- `month` (required): Month (format: MM, 01-12)

**Response:**
```json
{
  "year": 2025,
  "month": 1,
  "total_sales": 3500000,
  "total_profit": 700000,
  "transaction_count": 450,
  "daily_breakdown": [
    {
      "date": "2025-01-01",
      "sales": 120000
    }
  ]
}
```

---

### GET /customer/reports/profit
Get profit report (requires auth).

**Query Parameters:**
- `date_from` (required): Start date (format: YYYY-MM-DD)
- `date_to` (required): End date (format: YYYY-MM-DD)

**Response:**
```json
{
  "date_from": "2025-01-01",
  "date_to": "2025-01-31",
  "total_revenue": 3500000,
  "total_cost": 2800000,
  "total_profit": 700000,
  "profit_margin": 20,
  "breakdown_by_category": [
    {
      "category": "Electronics",
      "revenue": 2000000,
      "cost": 1600000,
      "profit": 400000
    }
  ]
}
```

---

## 📍 Location Tracking Endpoint

### POST /customer/location
Track customer location (requires auth).

**Request:**
```json
{
  "latitude": 23.810331,
  "longitude": 90.412521,
  "timestamp": "2025-01-16T14:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location tracked successfully"
}
```

**Note:** This endpoint should be called every 3-5 minutes during business hours.

---

## 👤 Profile Endpoints

### POST /customer/change-password
Change customer password (requires auth).

**Request:**
```json
{
  "old_password": "current_password",
  "new_password": "new_password_123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**Status Codes:**
- 200: Password changed successfully
- 401: Invalid current password
- 422: Validation error

---

### PUT /customer/profile
Update customer profile (requires auth).

**Request:**
```json
{
  "name": "John Doe",
  "phone": "01712345678",
  "address": "123 Main St, City"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "customer@example.com",
    "phone": "01712345678",
    "address": "123 Main St, City",
    "credit_limit": 50000,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

## 🔒 Authentication Headers

All protected endpoints require the Authorization header:

```
Authorization: Bearer {jwt_token}
```

---

## ⚠️ Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized. Token expired or invalid."
}
```

### 422 Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📝 Implementation Notes

1. **Date Format**: Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) for timestamps
2. **Pagination**: Use page numbering starting from 1. Default 15 items per page
3. **Currency**: All monetary values in smallest unit (e.g., paise, cents)
4. **HTTP Status Codes**:
   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 422: Unprocessable Entity
   - 500: Server Error

5. **CORS**: Enable CORS for localhost:4200 in development

---

## 🔄 Token Refresh (Optional Enhancement)

If implementing token refresh:

```
POST /refresh-token
Headers: { "Authorization": "Bearer {expired_token}" }
Response: { "token": "new_token" }
```

Update the auth interceptor to handle 401 and automatically request a new token.

---

## 📱 Mobile-Specific Considerations

- Location endpoint should be non-blocking (fire-and-forget)
- Consider implementing batch uploads for location data
- Handle offline scenarios gracefully
- Implement retry logic for failed requests

---

**API Version**: 1.0  
**Last Updated**: 2025-01-16
