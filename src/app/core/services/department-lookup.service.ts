import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DepartmentLookupApi, DepartmentLookupOption } from '../models/department-lookup.model';

@Injectable({ providedIn: 'root' })
export class DepartmentLookupService {
  private readonly http = inject(HttpClient);

  private readonly departmentListUrl = `${environment.apiBaseUrl}/api/centralizedAPI/DepartmentList`;

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
    const params = new HttpParams().set('tenantId', this.tenantId);

    return this.http
      .get<DepartmentLookupApi[] | { data?: DepartmentLookupApi[]; Data?: DepartmentLookupApi[] }>(
        this.departmentListUrl,
        { params },
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
