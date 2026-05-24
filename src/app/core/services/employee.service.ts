import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Employee } from '../models/employee.model';
import { ApiService } from './api.service';

// Feature-specific service keeps employee API calls in one place.
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly api = inject(ApiService);

  getEmployees(): Observable<Employee[]> {
    // Observable used because API responses arrive asynchronously over time.
    return this.api.get<Employee[]>('employees');
  }
}
