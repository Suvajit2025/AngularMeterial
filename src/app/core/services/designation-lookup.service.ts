import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DesignationLookupApi, DesignationLookupOption } from '../models/designation-lookup.model';

@Injectable({ providedIn: 'root' })
export class DesignationLookupService {
  private readonly http = inject(HttpClient);

  private readonly designationListUrl = `${environment.apiBaseUrl}/api/centralizedAPI/SOPDesignation`;

  private readonly tenantId = environment.tenantId;

  // Designation lookup data is shared across many forms, so cache the first API response.
  private readonly designations$ = this.loadDesignations().pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getDesignations(): Observable<DesignationLookupOption[]> {
    // RxJS Observable is used because designation data comes from an API.
    return this.designations$;
  }

  private loadDesignations(): Observable<DesignationLookupOption[]> {
    const params = new HttpParams().set('tenantId', this.tenantId);

    return this.http
      .get<DesignationLookupApi[] | { data?: DesignationLookupApi[]; Data?: DesignationLookupApi[] }>(
        this.designationListUrl,
        { params },
      )
      .pipe(
        map((response) => {
          const designations = Array.isArray(response)
            ? response
            : response.data ?? response.Data ?? [];

          return designations.map((designation) => this.toOption(designation));
        }),
        // Empty fallback keeps forms stable if API/CORS/network is temporarily unavailable.
        catchError(() => of([] as DesignationLookupOption[])),
      );
  }

  private toOption(designation: DesignationLookupApi): DesignationLookupOption {
    return {
      designationId: designation.IDDesignation,
      name: designation.Name,
    };
  }
}
