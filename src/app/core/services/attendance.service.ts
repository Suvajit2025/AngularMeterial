import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AttendanceSummary } from '../models/attendance-summary.model';
import { ApiService } from './api.service';

// Feature-specific service for attendance APIs.
@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly api = inject(ApiService);

  getTodaySummary(): Observable<AttendanceSummary> {
    return this.api.get<AttendanceSummary>('attendance/today-summary');
  }
}
