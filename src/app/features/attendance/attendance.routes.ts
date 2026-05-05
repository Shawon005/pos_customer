import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { AttendanceActionComponent } from './components/attendance-action.component';
import { AttendanceDetailsComponent } from './components/attendance-details.component';

export const attendanceRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'action', component: AttendanceActionComponent },
      { path: 'details', component: AttendanceDetailsComponent },
      { path: '', redirectTo: 'action', pathMatch: 'full' }
    ]
  }
];
