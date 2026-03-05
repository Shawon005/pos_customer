import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LocationData } from '../models/product.model';

export type LocationPermissionResult = 'granted' | 'denied' | 'unavailable';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationSubject = new BehaviorSubject<LocationData | null>(null);
  public location$ = this.locationSubject.asObservable();

  private trackingSubscription: Subscription | null = null;
  private readonly TRACKING_INTERVAL = 3 * 60 * 1000; // 3 minutes
  private readonly QUICK_LOCATION_OPTIONS: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 120000
  };
  private readonly PRECISE_LOCATION_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0
  };

  constructor(private apiService: ApiService) {}

  requestPermissionAndStartTracking(): void {
    this.ensurePermissionAndStartTracking().catch(error => {
      console.error('Location permission flow error:', error);
    });
  }

  ensurePermissionAndStartTracking(): Promise<LocationPermissionResult> {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        console.error('Geolocation not supported');
        resolve('unavailable');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          // Permission granted, start tracking
          this.startTracking();
          resolve('granted');
        },
        (error) => {
          console.error('Permission error:', error);
          resolve(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
        },
        {
          ...this.QUICK_LOCATION_OPTIONS
        }
      );
    });
  }

  startTracking(): void {
    if (this.trackingSubscription) {
      return; // Already tracking
    }

    this.trackingSubscription = interval(this.TRACKING_INTERVAL)
      .pipe(
        switchMap(() => this.getCurrentLocation()),
        tap(location => {
          this.sendLocationToAPI(location);
        })
      )
      .subscribe();

    // Get initial location immediately
    this.getCurrentLocation().subscribe(location => {
      this.sendLocationToAPI(location);
    });
  }

  stopTracking(): void {
    if (this.trackingSubscription) {
      this.trackingSubscription.unsubscribe();
      this.trackingSubscription = null;
    }
  }

  private getCurrentLocation(): Observable<LocationData> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString()
          };
          this.locationSubject.next(location);
          observer.next(location);
          observer.complete();
        },
        async error => {
          if (error.code === error.TIMEOUT) {
            try {
              const retryPosition = await this.getPosition(this.PRECISE_LOCATION_OPTIONS);
              const retryLocation: LocationData = {
                latitude: retryPosition.coords.latitude,
                longitude: retryPosition.coords.longitude,
                timestamp: new Date().toISOString()
              };
              this.locationSubject.next(retryLocation);
              observer.next(retryLocation);
              observer.complete();
              return;
            } catch (retryError) {
              console.error('Geolocation retry failed:', retryError);
              observer.error(retryError);
              return;
            }
          }

          console.error('Geolocation error:', error);
          observer.error(error);
        },
        this.QUICK_LOCATION_OPTIONS
      );
    });
  }

  private getPosition(options: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  private sendLocationToAPI(location: LocationData): void {
    this.apiService.trackLocation(location).subscribe(
      () => {
        console.log('Location tracked:', location);
      },
      error => {
        console.error('Failed to track location:', error);
      }
    );
  }

  getCurrentLocationOnce(): Observable<LocationData> {
    return this.getCurrentLocation();
  }
}
