import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { attendanceRoutes } from './attendance.routes';
import { AttendanceActionComponent } from './components/attendance-action.component';
import { AttendanceDetailsComponent } from './components/attendance-details.component';

@NgModule({
  declarations: [AttendanceActionComponent, AttendanceDetailsComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(attendanceRoutes)]
})
export class AttendanceModule {}
