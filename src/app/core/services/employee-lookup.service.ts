import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { EmployeeLookupApi, EmployeeLookupOption } from '../models/employee-lookup.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EmployeeLookupService {
  // ApiService is used for calling backend APIs.
  private readonly api = inject(ApiService);

  // AuthService gives tenant id from local storage.
  private readonly authService = inject(AuthService);

  // shareReplay caches the employee list after the first API call.
  // This is useful because many pages may need the same employee dropdown.
  private readonly employees$ = this.loadEmployees().pipe(shareReplay({ bufferSize: 1, refCount: true }));

  getEmployees(): Observable<EmployeeLookupOption[]> {
    // RxJS Observable is used because employee data comes asynchronously from an API.
    return this.employees$;
  }

  private loadEmployees(): Observable<EmployeeLookupOption[]> {
    // Get tenant id from local storage before calling the API.
    const tenantId = this.authService.getTenantId();

    return this.api
      .get<EmployeeLookupApi[] | { data?: EmployeeLookupApi[]; Data?: EmployeeLookupApi[] }>(
        '/api/centralizedAPI/EmployeeList',
        { params: { tenantId } },
      )
      .pipe(
        map((response) => {
          // API can return direct array or wrapped data.
          const employees = Array.isArray(response)
            ? response
            : response.data ?? response.Data ?? [];

          // Convert API data into dropdown options.
          return employees.map((employee) => this.toOption(employee));
        }),
        // If API/CORS/network fails, keep the UI stable with an empty list.
        catchError(() => of([] as EmployeeLookupOption[])),
      );
  }

  private toOption(employee: EmployeeLookupApi): EmployeeLookupOption {
    // Use employee name when available, otherwise show employee number.
    const employeeName = employee.Employee || String(employee.empno);

    // Keep only the fields needed by employee dropdowns.
    return {
      empId: employee.EmpID,
      empNo: employee.empno,
      label: employeeName,
      email: employee.empemail || '',
      imageUrl: this.getEmployeeImage(employeeName, employee.FileLocation),
      initials: this.getInitials(employeeName),
    };
  }

  private getEmployeeImage(employeeName: string, fileLocation: string | null): string {
    const imageUrl = fileLocation?.trim() ?? '';
    const isNoImage = imageUrl.toLowerCase().includes('/noimage.png');

    // The backend sends noimage.png for employees without a real photo.
    // For those records we show a generated initials avatar instead.
    return imageUrl && !isNoImage ? imageUrl : this.getAvatarUrl(employeeName);
  }

  private getAvatarUrl(employeeName: string): string {
    // Create a default avatar when employee photo is not available.
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeName)}&background=2563eb&color=ffffff&bold=true`;
  }

  private getInitials(employeeName: string): string {
    // Make short initials from the employee name.
    return employeeName
      .replace(/-\d+$/, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}
