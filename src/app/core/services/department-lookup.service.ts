import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DepartmentLookupApi, DepartmentLookupOption } from '../models/department-lookup.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DepartmentLookupService {
  private readonly api = inject(ApiService);

  private readonly tenantId = environment.tenantId;

  // Department lists are shared across many pages, so we cache the first API response.
  private readonly departments$ = this.loadDepartments().pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getDepartments(): Observable<DepartmentLookupOption[]> {
    // RxJS Observable is used because department data comes from an API.
    return this.departments$;
  }

  private loadDepartments(): Observable<DepartmentLookupOption[]> {
    return this.api
      .get<DepartmentLookupApi[] | { data?: DepartmentLookupApi[]; Data?: DepartmentLookupApi[] }>(
        '/api/centralizedAPI/DepartmentList',
        { params: { tenantId: this.tenantId } },
      )
      .pipe(
        map((response) => {
          const departments = Array.isArray(response)
            ? response
            : response.data ?? response.Data ?? [];

          return departments.map((department) => this.toOption(department));
        }),
        // Empty fallback keeps forms stable if API/CORS/network is temporarily unavailable.
        catchError(() => of([] as DepartmentLookupOption[])),
      );
  }

  private toOption(department: DepartmentLookupApi): DepartmentLookupOption {
    return {
      departmentId: department.IDDepartment,
      name: department.Name,
    };
  }
}
