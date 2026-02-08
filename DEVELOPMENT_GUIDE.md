# POS Customer - Inventory & Sales Mobile App

A modern, mobile-first Angular 17+ application for customer inventory management and point-of-sale (POS) operations. Built to be converted to a native mobile app using Capacitor.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [API Integration](#api-integration)
- [Mobile Deployment](#mobile-deployment)
- [Development Guide](#development-guide)

---

## ✨ Features

### Core Functionality
- **Authentication**: Email/Password login with JWT token management
- **Dashboard**: Real-time stats, sales trends, low stock alerts
- **Inventory Management**: Search, filter, and track product stock
- **Point of Sale**: Complete cart system, discounts, invoice generation
- **Sales History**: Filter and view detailed sale records
- **Reports**: Daily, weekly, monthly sales and profit analytics
- **Location Tracking**: Automatic GPS tracking every 3-5 minutes
- **User Profile**: Change password, app settings, logout

### Technical Features
- ✅ Mobile-first responsive design
- ✅ Offline detection capability
- ✅ PWA ready (Install as app)
- ✅ Touch-optimized UI
- ✅ Real-time notifications
- ✅ Auto token refresh on expiry
- ✅ Secure local storage
- ✅ Lazy loading for performance

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── services/            # HTTP, Auth, Location, Notification
│   │   ├── guards/              # Auth guard
│   │   ├── interceptors/        # Auth token interceptor
│   │   └── models/              # TypeScript interfaces
│   ├── features/                # Feature modules
│   │   ├── auth/                # Login component
│   │   ├── dashboard/           # Dashboard with stats & charts
│   │   ├── stock/               # Inventory management
│   │   ├── pos/                 # Point of sale system
│   │   ├── sales/               # Sales history
│   │   ├── reports/             # Analytics & reports
│   │   └── profile/             # User profile & settings
│   ├── shared/                  # Shared components
│   │   ├── components/          # Reusable UI components
│   │   └── pipes/               # Custom pipes
│   ├── app.routes.ts            # Application routing
│   └── app.ts                   # Root component
├── environments/                # Environment configuration
├── styles.css                   # Global styles
├── index.html                   # Main HTML
└── main.ts                      # Bootstrap file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Angular 17+ requirement)
- npm 8+ or yarn
- Git

### Installation

```bash
# Clone or navigate to project
cd POS-Customer

# Install dependencies
npm install

# Start development server
npm start

# Open in browser
# http://localhost:4200
```

### Login Credentials
Use demo credentials provided by your Laravel backend setup.

---

## ⚙️ Configuration

### API Configuration
Update the API URL in environment files:

**`src/environments/environment.ts`** (Development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'  // Your Laravel API
};
```

**`src/environments/environment.prod.ts`** (Production)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://yourdomain.com/api'
};
```

### Capacitor Configuration
Mobile app settings in `capacitor.config.ts`:
```typescript
{
  appId: 'com.pos.customer',
  appName: 'POS Customer',
  webDir: 'dist/POS-Customer/browser'
}
```

---

## 🏗️ Architecture

### Authentication Flow
1. User logs in with email/password
2. Backend returns JWT token + customer data
3. Token stored in localStorage
4. Auth interceptor attaches token to all API requests
5. On 401 error, user redirected to login

### State Management
- Uses RxJS BehaviorSubjects for state
- Services manage domain logic
- Components use async pipe for subscriptions
- Local storage for persistent data

### Component Hierarchy
```
App (Root)
├── ToastContainer (Notifications)
├── RouterOutlet (Page Content)
└── BottomNav (Navigation)
    ├── Dashboard
    ├── Stock
    ├── POS
    ├── Sales
    └── Profile
```

---

## 🔌 API Integration

### Required Endpoints

#### Authentication
```
POST /login
Payload: { email, password }
Returns: { token, customer }
```

#### Dashboard
```
GET /customer/dashboard
Returns: { total_stock_items, total_sales_today, total_profit_today, low_stock_count }

GET /customer/sales-chart
Returns: [{ date, sales }, ...]
```

#### Stock
```
GET /customer/stocks?search=&category=
Returns: Product[]

GET /customer/stock-categories
Returns: string[]
```

#### POS
```
POST /customer/pos/sell
Payload: { items: [{ product_id, quantity }], discount, payment_method }
Returns: Sale
```

#### Sales
```
GET /customer/sales?date_from=&date_to=
Returns: Sale[]

GET /customer/sales/:id
Returns: Sale (with details)
```

#### Reports
```
GET /customer/reports/daily?date=
GET /customer/reports/weekly?week_start=
GET /customer/reports/monthly?year=&month=
GET /customer/reports/profit?date_from=&date_to=
```

#### Location
```
POST /customer/location
Payload: { latitude, longitude, timestamp }
```

#### Profile
```
POST /customer/change-password
Payload: { old_password, new_password }

PUT /customer/profile
Payload: { customer_data }
```

---

## 📱 Mobile Deployment

### Building for Android

```bash
# 1. Build web app
npm run build

# 2. Add Android platform (first time only)
npx cap add android

# 3. Sync web assets
npx cap sync android

# 4. Open in Android Studio
npx cap open android

# 5. Build and run from Android Studio
```

### Building for iOS

```bash
# 1. Build web app
npm run build

# 2. Add iOS platform (first time only)
npx cap add ios

# 3. Sync web assets
npx cap sync ios

# 4. Open in Xcode
npx cap open ios

# 5. Build and run from Xcode
```

### Required Permissions (Android)
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Required Permissions (iOS)
Add to `ios/App/App/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to track deliveries</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>We need your location for background tracking</string>
```

---

## 💻 Development Guide

### Adding a New Feature

1. **Create component in feature folder**
```bash
mkdir src/app/features/my-feature/components
```

2. **Create standalone component**
```typescript
@Component({
  selector: 'app-my-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: '...',
  styles: ['...']
})
export class MyFeatureComponent { }
```

3. **Add route in `app.routes.ts`**
```typescript
{
  path: 'my-feature',
  component: MyFeatureComponent,
  canActivate: [AuthGuard]
}
```

4. **Add to bottom nav (if main section)**
```typescript
// in bottom-nav.component.ts
navItems: NavItem[] = [
  // ... existing items
  { label: 'My Feature', icon: '🎯', route: '/my-feature' }
];
```

### Using Services

```typescript
// Inject service
constructor(private apiService: ApiService) {}

// Use in component
ngOnInit() {
  this.apiService.getCustomerStocks().subscribe(
    data => { /* handle success */ },
    error => { /* handle error */ }
  );
}
```

### Styling Guidelines

- **Mobile-first approach**: Base styles for mobile, use media queries for larger screens
- **Colors**: Primary #667eea, Success #27ae60, Error #e74c3c, Warning #f39c12
- **Spacing**: Use 4px, 8px, 12px, 16px, 20px, 24px increments
- **Typography**: Use system fonts, 13px-16px body text

### Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run e2e

# Run with coverage
npm run test -- --code-coverage
```

---

## 🔒 Security Considerations

- Tokens stored in localStorage (consider SessionStorage for higher security)
- HTTPS enforced in production
- JWT expiry handled automatically
- Sensitive data sanitized
- CORS enabled on backend
- XSS protection via Angular's built-in DomSanitizer

### Improving Security

```typescript
// Use secure storage in Capacitor
import { Storage } from '@capacitor/storage';

await Storage.set({
  key: 'auth_token',
  value: token
});
```

---

## 📊 Performance Optimization

- Virtual scrolling for large lists (TODO: implement)
- Image lazy loading (TODO: implement)
- Tree shaking (automatic with ng build)
- Code splitting with lazy loading
- Service Worker for offline support (TODO: implement)

---

## 🐛 Troubleshooting

### API Connection Issues
- Check environment.ts apiUrl
- Ensure backend is running
- Check CORS headers on backend
- Verify network connectivity

### Location Tracking Not Working
- Check device permissions
- Ensure HTTPS in production (required for geolocation)
- Check browser console for errors
- Verify location service is enabled on device

### Login Loop
- Clear localStorage
- Check token expiry time
- Verify JWT claims in token
- Check Auth Guard implementation

---

## 📦 Dependencies

### Core Angular
- @angular/common
- @angular/core
- @angular/forms
- @angular/platform-browser
- @angular/router

### Additional (Optional)
- ng2-charts: For advanced chart visualization
- @capacitor/geolocation: For better location tracking
- @capacitor/local-notifications: For push notifications

Install with:
```bash
npm install ng2-charts
npm install @capacitor/geolocation @capacitor/local-notifications
```

---

## 🚢 Deployment

### Web Deployment (Firebase, Netlify, Vercel)

```bash
# Build for production
npm run build

# Deploy dist/POS-Customer/browser folder
```

### Mobile App Distribution

- **Android**: Build APK/AAB in Android Studio, upload to Google Play Store
- **iOS**: Build IPA in Xcode, upload to App Store Connect

---

## 📝 License

Copyright 2025. All rights reserved.

---

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Contact development team

---

## 📅 Changelog

### v1.0.0 (Initial Release)
- Authentication system
- Dashboard with statistics
- Inventory management
- Point of Sale system
- Sales history
- Reports section
- Location tracking
- Profile management
- PWA ready
- Capacitor integration

---

**Built with ❤️ for mobile-first inventory management**
