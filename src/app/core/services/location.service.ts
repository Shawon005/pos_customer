import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LocationData } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationSubject = new BehaviorSubject<LocationData | null>(null);
  public location$ = this.locationSubject.asObservable();

  private trackingSubscription: Subscription | null = null;
  private readonly TRACKING_INTERVAL = 3 * 60 * 1000; // 3 minutes

  constructor(private apiService: ApiService) {}

  requestPermissionAndStartTracking(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // Permission granted, start tracking
        this.startTracking();
      },
      (error) => {
        console.error('Permission error:', error);
        // Optionally handle denied permission here
      }
    );
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
        error => {
          console.error('Geolocation error:', error);
          observer.error(error);
        }
      );
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
