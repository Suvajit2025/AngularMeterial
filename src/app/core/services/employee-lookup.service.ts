import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EmployeeLookupApi, EmployeeLookupOption } from '../models/employee-lookup.model';

@Injectable({ providedIn: 'root' })
export class EmployeeLookupService {
  private readonly http = inject(HttpClient);

  private readonly employeeListUrl = `${environment.apiBaseUrl}/api/centralizedAPI/EmployeeList`;

  private readonly tenantId = environment.tenantId;

  // shareReplay caches the employee list after the first API call.
  // This is useful because many pages may need the same employee dropdown.
  private readonly employees$ = this.loadEmployees().pipe(shareReplay({ bufferSize: 1, refCount: true }));

  getEmployees(): Observable<EmployeeLookupOption[]> {
    // RxJS Observable is used because employee data comes asynchronously from an API.
    return this.employees$;
  }

  private loadEmployees(): Observable<EmployeeLookupOption[]> {
    const params = new HttpParams().set('tenantId', this.tenantId);

    return this.http
      .get<EmployeeLookupApi[] | { data?: EmployeeLookupApi[]; Data?: EmployeeLookupApi[] }>(
        this.employeeListUrl,
        { params },
      )
      .pipe(
        map((response) => {
          const employees = Array.isArray(response)
            ? response
            : response.data ?? response.Data ?? [];

          return employees.map((employee) => this.toOption(employee));
        }),
        // If API/CORS/network fails, keep the UI stable with an empty list.
        catchError(() => of([] as EmployeeLookupOption[])),
      );
  }

  private toOption(employee: EmployeeLookupApi): EmployeeLookupOption {
    const employeeName = employee.Employee || String(employee.empno);

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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeName)}&background=2563eb&color=ffffff&bold=true`;
  }

  private getInitials(employeeName: string): string {
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
