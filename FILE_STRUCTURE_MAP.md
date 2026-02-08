# 📊 POS Customer App - File Structure & Component Map

## Quick Navigation Guide

### 🌳 Complete File Tree

```
POS-Customer/
│
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 core/                    [Core Infrastructure]
│   │   │   ├── 📁 services/
│   │   │   │   ├── auth.service.ts     [Login, JWT, Token]
│   │   │   │   ├── api.service.ts      [All HTTP Endpoints]
│   │   │   │   ├── location.service.ts [GPS Tracking]
│   │   │   │   ├── notification.service.ts [Toast Messages]
│   │   │   │   └── storage.service.ts  [LocalStorage Wrapper]
│   │   │   ├── 📁 guards/
│   │   │   │   └── auth.guard.ts       [Route Protection]
│   │   │   ├── 📁 interceptors/
│   │   │   │   └── auth.interceptor.ts [JWT Token Injection]
│   │   │   └── 📁 models/
│   │   │       ├── auth.model.ts       [Auth Interfaces]
│   │   │       └── product.model.ts    [Domain Models]
│   │   │
│   │   ├── 📁 features/                [Main Features - 8 Modules]
│   │   │   ├── 📁 auth/
│   │   │   │   └── components/
│   │   │   │       └── login.component.ts [🔐 Login Page]
│   │   │   │
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── components/
│   │   │   │       └── dashboard.component.ts [📊 Dashboard]
│   │   │   │           - Stats cards
│   │   │   │           - Sales chart
│   │   │   │           - Quick actions
│   │   │   │
│   │   │   ├── 📁 stock/
│   │   │   │   └── components/
│   │   │   │       └── stock.component.ts [📦 Inventory]
│   │   │   │           - Product list
│   │   │   │           - Search
│   │   │   │           - Category filter
│   │   │   │
│   │   │   ├── 📁 pos/
│   │   │   │   └── components/
│   │   │   │       └── pos.component.ts [🛒 Point of Sale]
│   │   │   │           - Product search
│   │   │   │           - Cart system
│   │   │   │           - Discount
│   │   │   │           - Checkout
│   │   │   │
│   │   │   ├── 📁 sales/
│   │   │   │   └── components/
│   │   │   │       └── sales.component.ts [📈 Sales History]
│   │   │   │           - Sales list
│   │   │   │           - Date filter
│   │   │   │           - Details modal
│   │   │   │
│   │   │   ├── 📁 reports/
│   │   │   │   └── components/
│   │   │   │       └── reports.component.ts [📊 Reports]
│   │   │   │           - Daily/Weekly/Monthly
│   │   │   │           - Profit analysis
│   │   │   │           - Chart-ready
│   │   │   │
│   │   │   └── 📁 profile/
│   │   │       └── components/
│   │   │           └── profile.component.ts [👤 Profile]
│   │   │               - Customer info
│   │   │               - Password change
│   │   │               - Settings
│   │   │
│   │   ├── 📁 shared/                  [Shared Components]
│   │   │   ├── 📁 components/
│   │   │   │   ├── toast.component.ts [🔔 Toast Notification]
│   │   │   │   ├── toast-container.component.ts [Container]
│   │   │   │   └── bottom-nav.component.ts [🗂️ Bottom Nav Bar]
│   │   │   └── 📁 pipes/              [Custom Pipes - Empty]
│   │   │
│   │   ├── app.ts                      [🎯 Root Component]
│   │   │   - AppComponent
│   │   │   - HTTP Setup
│   │   │   - Location Tracking Init
│   │   │
│   │   ├── app.routes.ts               [🛣️ Routing Configuration]
│   │   │   - 7 main routes
│   │   │   - Auth guard on protected routes
│   │   │   - Redirect logic
│   │   │
│   │   └── app.spec.ts                 [Test File - Existing]
│   │
│   ├── 📁 environments/                [Configuration]
│   │   ├── environment.ts              [Development Config]
│   │   └── environment.prod.ts         [Production Config]
│   │
│   ├── index.html                      [📄 Main HTML Entry]
│   ├── main.ts                         [🚀 Bootstrap]
│   └── styles.css                      [🎨 Global Styles]
│
├── 📁 public/
│   └── manifest.webmanifest            [📱 PWA Manifest]
│
├── capacitor.config.ts                 [📱 Mobile Config]
│
├── 📚 DOCUMENTATION FILES (6)
│   ├── INDEX.md                        [📖 Overview & Reference]
│   ├── IMPLEMENTATION_COMPLETE.md      [✅ What's Included]
│   ├── QUICK_START.md                  [⚡ 5-Minute Setup]
│   ├── SETUP_CHECKLIST.md              [✓ Complete Checklist]
│   ├── DEVELOPMENT_GUIDE.md            [🛠️ Full Reference]
│   ├── API_INTEGRATION.md              [🔌 API Documentation]
│   └── NG2-CHARTS_GUIDE.md             [📊 Charts Guide]
│
└── 📄 Standard Files
    ├── package.json                    [Dependencies]
    ├── angular.json                    [Build Config]
    ├── tsconfig.json                   [TypeScript Config]
    └── README.md                       [Original]
```

---

## 🎯 Component Hierarchy

```
App (Root)
│
├── ToastContainer
│   └── Toast (Multiple)
│       ├── Success Messages
│       ├── Error Messages
│       ├── Info Messages
│       └── Warning Messages
│
├── RouterOutlet (Page Content)
│   ├── LoginComponent          [/auth/login]
│   ├── DashboardComponent      [/dashboard]
│   ├── StockComponent          [/stock]
│   ├── POSComponent            [/pos]
│   ├── SalesComponent          [/sales]
│   ├── ReportsComponent        [/reports]
│   └── ProfileComponent        [/profile]
│
└── BottomNavComponent
    ├── Dashboard Link
    ├── Stock Link
    ├── POS Link
    ├── Sales Link
    └── Profile Link
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────┐
│   User Interface Layer              │
│  (Components: Login, Dashboard etc) │
└──────────────────┬──────────────────┘
                   │ Uses
                   ▼
┌─────────────────────────────────────┐
│   Services Layer                    │
│  ┌───────────────────────────────┐ │
│  │ • AuthService                 │ │
│  │ • ApiService                  │ │
│  │ • LocationService             │ │
│  │ • NotificationService         │ │
│  │ • StorageService              │ │
│  └───────────────────────────────┘ │
└──────────────────┬──────────────────┘
                   │ Uses
                   ▼
┌─────────────────────────────────────┐
│   HTTP + Interceptor Layer          │
│  ┌───────────────────────────────┐ │
│  │ AuthInterceptor               │ │
│  │  - Adds Bearer Token          │ │
│  │  - Handles 401 Errors         │ │
│  └───────────────────────────────┘ │
└──────────────────┬──────────────────┘
                   │ Makes Requests to
                   ▼
┌─────────────────────────────────────┐
│   Laravel REST API Backend          │
│  ┌───────────────────────────────┐ │
│  │ • POST /login                 │ │
│  │ • GET /customer/dashboard     │ │
│  │ • GET /customer/stocks        │ │
│  │ • POST /customer/pos/sell     │ │
│  │ • GET /customer/sales         │ │
│  │ • GET /customer/reports/*     │ │
│  │ • POST /customer/location     │ │
│  │ + More endpoints              │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
Login Page (Unauthenticated)
       │
       │ Submit Credentials
       ▼
AuthService.login()
       │
       │ POST /login
       ▼
Backend Returns JWT Token
       │
       │ Store Token
       ▼
localStorage
  • auth_token
  • customer_data
       │
       │ Redirect to
       ▼
Dashboard (Protected by AuthGuard)
       │
       │ Every API Request
       ▼
AuthInterceptor
  • Adds: Authorization: Bearer {token}
       │
       │ API Returns 401?
       ├─ YES ──→ logout() → Redirect to Login
       └─ NO ──→ Success
```

---

## 📄 Service Responsibilities

### AuthService
```
Responsibilities:
├── User login (credentials → JWT token)
├── Store token in localStorage
├── Store customer data
├── Retrieve current auth state
├── Check if authenticated
├── Logout (clear storage)
├── Change password
└── Publish auth state changes

Used By:
├── LoginComponent (login)
├── AppComponent (init)
├── AuthGuard (route protection)
├── ProfileComponent (password change)
└── ProfileComponent (logout)
```

### ApiService
```
Responsibilities:
├── Dashboard endpoints
│   ├── getDashboardStats()
│   └── getSalesChart()
├── Stock endpoints
│   ├── getCustomerStocks()
│   ├── getProductById()
│   └── getStockCategories()
├── POS endpoints
│   └── processSale()
├── Sales endpoints
│   ├── getSalesHistory()
│   └── getSaleDetails()
├── Report endpoints
│   ├── getDailySalesReport()
│   ├── getWeeklySalesReport()
│   ├── getMonthlySalesReport()
│   └── getProfitReport()
├── Location endpoints
│   └── trackLocation()
└── Profile endpoints
    ├── updateProfile()
    └── (changePassword via AuthService)

Used By:
├── DashboardComponent (stats, chart)
├── StockComponent (products, categories)
├── POSComponent (process sale)
├── SalesComponent (history)
├── ReportsComponent (analytics)
└── LocationService (tracking)
```

### LocationService
```
Responsibilities:
├── Request geolocation permission
├── Get current location
├── Start continuous tracking (3-5 min)
├── Stop tracking
├── Send location to API
└── Publish location updates

Used By:
├── AppComponent (start on login)
└── ProfileComponent (toggle setting)
```

### NotificationService
```
Responsibilities:
├── Show success toast
├── Show error toast
├── Show info toast
├── Show warning toast
├── Auto-dismiss toast
├── Manual dismiss
└── Publish toast list

Used By:
├── All Components (feedback)
├── All Services (error handling)
└── ToastContainerComponent (display)
```

### StorageService
```
Responsibilities:
├── Set item (JSON safe)
├── Get item (JSON parse)
├── Remove item
├── Clear storage
└── Check if exists

Used By:
├── AuthService (token, customer)
└── Optionally by other services
```

---

## 🛣️ Routing Map

```
Application Routes:

/auth
  ├── /login              [LoginComponent]          Public
  └── /                   → Redirect to /login

/dashboard              [DashboardComponent]        Protected
/stock                  [StockComponent]            Protected
/pos                    [POSComponent]              Protected
/sales                  [SalesComponent]            Protected
/reports                [ReportsComponent]          Protected
/profile                [ProfileComponent]          Protected

/                       → Redirect to /dashboard

/**                     → Redirect to /dashboard

Legend:
Protected = Requires AuthGuard (user must be logged in)
Public = Accessible without login
```

---

## 💾 Data Models

### AuthModel
```typescript
LoginRequest {
  email: string
  password: string
}

LoginResponse {
  success: boolean
  message: string
  token: string
  customer: Customer
}

Customer {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  credit_limit?: number
  created_at: string
}

AuthState {
  token: string | null
  customer: Customer | null
  isAuthenticated: boolean
}
```

### ProductModel
```typescript
Product {
  id, name, sku, image_url
  category, quantity
  cost_price, sell_price
  min_stock, created_at
}

CartItem {
  product: Product
  quantity: number
  subtotal: number
}

Sale {
  id, invoice_number, customer_id
  total_amount, discount, profit
  items: SaleItem[], created_at
}

SaleItem {
  id, product_id, product_name
  quantity, price, subtotal
}

DashboardStats {
  total_stock_items: number
  total_sales_today: number
  total_profit_today: number
  low_stock_count: number
}

SalesChartData {
  date: string
  sales: number
}

LocationData {
  latitude: number
  longitude: number
  timestamp: string
}
```

---

## 🎨 Styling Structure

```
Global Styles (src/styles.css)
├── Reset & Base Styles
├── Typography
├── Utility Classes
└── Media Queries

Component Scoped Styles
├── LoginComponent
│   └── Login card layout
├── DashboardComponent
│   └── Stats grid, chart, actions
├── StockComponent
│   └── Search, filter, card list
├── POSComponent
│   └── Search results, cart, checkout
├── SalesComponent
│   └── Sales list, filter, modal
├── ReportsComponent
│   └── Report cards
├── ProfileComponent
│   └── Profile card, forms
├── ToastComponent
│   └── Toast styling
├── BottomNavComponent
│   └── Bottom navigation styling
└── Other Components
```

---

## 📱 Mobile Considerations

```
Capacitor Config
├── App ID: com.pos.customer
├── App Name: POS Customer
├── Web Directory: dist/POS-Customer/browser
└── Plugins
    ├── SplashScreen
    └── CapacitorCookies

Android Requirements
├── AndroidManifest.xml
│   ├── Location permissions
│   ├── Internet permission
│   └── Network access
└── Gradle configuration

iOS Requirements
├── Info.plist
│   ├── Location usage description
│   ├── Background location
│   └── Internet access
└── Pod configuration
```

---

## 📊 Component Complexity Map

```
Simple Components (Low Complexity)
├── ToastComponent        [Just displays toast]
└── BottomNavComponent    [Navigation only]

Medium Complexity
├── LoginComponent        [Form + API call]
├── ReportsComponent      [Card display]
└── ProfileComponent      [Forms + API]

Complex Components (High Complexity)
├── DashboardComponent    [Multiple data sources, chart]
├── StockComponent        [Search, filter, list]
├── SalesComponent        [List, filter, modal]
└── POSComponent          [Cart logic, calculations]
```

---

## 🔗 Inter-Component Communication

```
AppComponent
├── Provides: HttpClientModule, AuthInterceptor
└── Manages: Location tracking lifecycle

Login → Dashboard
├── Via: Router navigation
└── Data: AuthState from AuthService

Dashboard → POS
├── Via: Router navigation
└── Data: Shared through services

POS → Sales
├── Via: Router navigation
└── Auto-loads: New sale appears in history

All Components
├── Receive: Notifications from NotificationService
├── Use: AuthService for auth state
└── Call: ApiService for data
```

---

## 🎯 Development Workflow

```
1. Start Dev Server
   npm start

2. Make Changes
   Edit .ts/.html/.css files
   → Auto-reload (5s)

3. Test Feature
   Browser DevTools (F12)
   → Check console
   → Check network
   → Check storage

4. Test Mobile
   http://YOUR_IP:4200
   → Test on device

5. Build Production
   npm run build
   → Check dist folder
   → Deploy

6. Deploy to Mobile
   npm run build
   npx cap sync
   npx cap open [android|ios]
   → Build & run from IDE
```

---

## ✅ Completion Status

| Category | Status | Details |
|----------|--------|---------|
| **Components** | ✅ | 12 complete, production-ready |
| **Services** | ✅ | 5 services, fully functional |
| **Routing** | ✅ | 7+ routes, guards configured |
| **Authentication** | ✅ | JWT, guards, interceptor |
| **UI/UX** | ✅ | Mobile-first, responsive |
| **Documentation** | ✅ | 6 comprehensive guides |
| **API Integration** | ✅ | All endpoints documented |
| **Mobile Ready** | ✅ | Capacitor configured |
| **PWA Ready** | ✅ | Manifest configured |
| **Production Ready** | ✅ | Full testing ready |

---

**Everything is structured, documented, and ready to use!**

Refer to [INDEX.md](./INDEX.md) for the complete overview.
