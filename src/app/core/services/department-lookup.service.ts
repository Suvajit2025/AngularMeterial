import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { DepartmentLookupApi, DepartmentLookupOption } from '../models/department-lookup.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DepartmentLookupService {
  // ApiService is used for calling backend APIs.
  private readonly api = inject(ApiService);

  // AuthService gives tenant id from local storage.
  private readonly authService = inject(AuthService);

  // Department lists are shared across many pages, so we cache the first API response.
  private readonly departments$ = this.loadDepartments().pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getDepartments(): Observable<DepartmentLookupOption[]> {
    // RxJS Observable is used because department data comes from an API.
    return this.departments$;
  }

  private loadDepartments(): Observable<DepartmentLookupOption[]> {
    // Get tenant id from local storage before calling the API.
    const tenantId = this.authService.getTenantId();

    return this.api
      .get<DepartmentLookupApi[] | { data?: DepartmentLookupApi[]; Data?: DepartmentLookupApi[] }>(
        '/api/centralizedAPI/DepartmentList',
        { params: { tenantId } },
      )
      .pipe(
        map((response) => {
          // API can return direct array or wrapped data.
          const departments = Array.isArray(response)
            ? response
            : response.data ?? response.Data ?? [];

          // Convert API data into dropdown options.
          return departments.map((department) => this.toOption(department));
        }),
        // Empty fallback keeps forms stable if API/CORS/network is temporarily unavailable.
        catchError(() => of([] as DepartmentLookupOption[])),
      );
  }

  private toOption(department: DepartmentLookupApi): DepartmentLookupOption {
    // Keep only the fields needed by the dropdown.
    return {
      departmentId: department.IDDepartment,
      name: department.Name,
    };
  }
}
