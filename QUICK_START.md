# POS Customer - Quick Start Guide

Get the POS Customer app running in minutes.

## ⚡ Quick Setup (5 minutes)

### 1️⃣ Install Dependencies
```bash
cd POS-Customer
npm install
```

### 2️⃣ Configure API URL
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'  // Your Laravel API URL
};
```

### 3️⃣ Start Development Server
```bash
npm start
```

Open browser to `http://localhost:4200`

### 4️⃣ Login
Use demo credentials from your Laravel backend

---

## 🏗️ Project Structure at a Glance

```
src/
├── app/
│   ├── core/              # Services, Guards, Models
│   ├── features/          # Feature modules (Dashboard, Stock, POS, etc.)
│   ├── shared/            # Shared components (Toast, BottomNav)
│   ├── app.routes.ts      # Routing
│   └── app.ts             # Root component
├── environments/          # API config
├── index.html             # Main HTML
├── main.ts                # Bootstrap
└── styles.css             # Global styles
```

---

## 🎯 Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/app.routes.ts` | Define all routes |
| `src/app/core/services/auth.service.ts` | Authentication logic |
| `src/app/core/services/api.service.ts` | HTTP requests |
| `src/environments/environment.ts` | API configuration |
| `capacitor.config.ts` | Mobile app settings |

---

## 🔑 Core Features Quick Reference

### Authentication
- **File**: `src/app/features/auth/components/login.component.ts`
- **Service**: `AuthService`
- Uses JWT tokens stored in localStorage

### Dashboard
- **File**: `src/app/features/dashboard/components/dashboard.component.ts`
- Shows: Stats, Sales Chart, Quick Actions
- Auto-loads on app startup

### Stock Management
- **File**: `src/app/features/stock/components/stock.component.ts`
- Features: Search, Filter by Category
- Shows: Available quantity, Price

### Point of Sale
- **File**: `src/app/features/pos/components/pos.component.ts`
- Features: Product search, Cart, Discount, Process Sale
- Auto-reduces stock on sale

### Sales History
- **File**: `src/app/features/sales/components/sales.component.ts`
- Features: Date filter, View details, Invoice number

### Reports
- **File**: `src/app/features/reports/components/reports.component.ts`
- Daily, Weekly, Monthly analytics
- Profit reports

### Profile
- **File**: `src/app/features/profile/components/profile.component.ts`
- Change password, Location tracking toggle, Logout

---

## 🛠️ Common Tasks

### Add a New Page

1. Create component:
```typescript
// src/app/features/my-page/components/my-page.component.ts
@Component({
  selector: 'app-my-page',
  standalone: true,
  imports: [CommonModule],
  template: '<div>My Page</div>',
  styles: []
})
export class MyPageComponent { }
```

2. Add route in `src/app/app.routes.ts`:
```typescript
{
  path: 'my-page',
  component: MyPageComponent,
  canActivate: [AuthGuard]
}
```

3. Add to bottom nav (if main section) in `src/app/shared/components/bottom-nav.component.ts`:
```typescript
navItems: NavItem[] = [
  // ... existing
  { label: 'My Page', icon: '🎯', route: '/my-page' }
];
```

### Call API Endpoint

```typescript
// In any component
constructor(private apiService: ApiService) {}

ngOnInit() {
  this.apiService.getCustomerStocks().subscribe({
    next: (data) => {
      // Handle success
      console.log(data);
    },
    error: (error) => {
      // Handle error
      this.notificationService.error('Failed to load');
    }
  });
}
```

### Add a Notification

```typescript
constructor(private notificationService: NotificationService) {}

// Success
this.notificationService.success('Sale completed!');

// Error
this.notificationService.error('Failed to save');

// Info
this.notificationService.info('Loading data...');

// Warning
this.notificationService.warning('Low stock');
```

### Style a Component

```typescript
@Component({
  selector: 'app-example',
  template: '<div class="container"><h1>Hello</h1></div>',
  styles: [`
    .container {
      padding: 16px;
      background: white;
      border-radius: 8px;
    }
  `]
})
```

---

## 📱 Mobile Development

### Test on Device

```bash
# Build web app
npm run build

# Sync to mobile
npx cap sync

# For Android (from Android Studio)
npx cap open android

# For iOS (from Xcode)
npx cap open ios
```

### Emulator Testing

```bash
# Android emulator
npx cap open android
# Then run from Android Studio

# iOS simulator
npx cap open ios
# Then run from Xcode
```

---

## 🔌 API Configuration

### Development
```typescript
// src/environments/environment.ts
apiUrl: 'http://localhost:8000/api'
```

### Production
```typescript
// src/environments/environment.prod.ts
apiUrl: 'https://yourdomain.com/api'
```

### Build for Production
```bash
npm run build
```

---

## 🐛 Debug Tips

### Check Network Requests
Open Browser DevTools → Network tab
- Watch API calls
- Check headers (Authorization token)
- Check response status

### Check Storage
Browser DevTools → Application → Storage → Local Storage
- `auth_token`: JWT token
- `customer_data`: User info

### Check Console
Browser DevTools → Console
- Error messages
- Debug logs
- Network errors

### Enable Debug Mode
Add to any service:
```typescript
console.log('Debug:', data);
```

---

## 📦 Dependencies

**Already Included:**
- Angular 21
- RxJS
- TypeScript
- Capacitor (optional, for mobile)

**Optional Additions:**
```bash
# Charts
npm install ng2-charts chart.js

# Better location
npm install @capacitor/geolocation

# Push notifications
npm install @capacitor/local-notifications
```

---

## ✅ Checklist Before Deployment

- [ ] Update API URL in `environment.prod.ts`
- [ ] Test all major features (Login, Stock, POS, Sales)
- [ ] Test on mobile device/emulator
- [ ] Check console for errors
- [ ] Enable HTTPS on backend
- [ ] Update app version in manifest
- [ ] Test location tracking (if used)
- [ ] Verify permissions (Android/iOS)

---

## 🚀 Deploy to Web

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init
npm run build
firebase deploy
```

### Vercel
```bash
npm install -g vercel
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Drag dist/POS-Customer/browser to Netlify
```

---

## 📚 Learn More

- [Angular Documentation](https://angular.io/docs)
- [RxJS Documentation](https://rxjs.dev)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| API not connecting | Check `environment.ts` apiUrl, ensure backend is running |
| Login fails | Verify credentials, check backend database |
| Port 4200 in use | `ng serve --port 4300` |
| Module not found | Run `npm install`, check imports |
| Token expired | Automatic logout and redirect to login |
| Stock not updating | Check sale payload, verify backend accepts data |

---

## 💡 Tips & Tricks

- Use `ng serve --poll` if files not reloading
- Use `ng serve --open` to auto-open browser
- Use Chrome DevTools Network tab to debug API
- Use async pipe `| async` in templates for RxJS
- Use `trackBy` in *ngFor for performance

---

## 🎨 Customization

### Change Theme Color
Update in multiple places:
1. `src/styles.css` - Primary color variables
2. `capacitor.config.ts` - `theme_color`
3. `public/manifest.webmanifest` - `theme_color`
4. Component styles - Gradient colors

### Change App Name
1. `public/manifest.webmanifest` - `name`, `short_name`
2. `capacitor.config.ts` - `appName`
3. `src/index.html` - `<title>`
4. `angular.json` - Project name

---

**Happy Coding! 🚀**

For detailed documentation, see:
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- [API_INTEGRATION.md](./API_INTEGRATION.md)
