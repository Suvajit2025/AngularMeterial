import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { DesignationLookupApi, DesignationLookupOption } from '../models/designation-lookup.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class DesignationLookupService {
  // ApiService is used for calling backend APIs.
  private readonly api = inject(ApiService);

  // AuthService gives tenant id from local storage.
  private readonly authService = inject(AuthService);

  // Designation lookup data is shared across many forms, so cache the first API response.
  private readonly designations$ = this.loadDesignations().pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getDesignations(): Observable<DesignationLookupOption[]> {
    // RxJS Observable is used because designation data comes from an API.
    return this.designations$;
  }

  private loadDesignations(): Observable<DesignationLookupOption[]> {
    // Get tenant id from local storage before calling the API.
    const tenantId = this.authService.getTenantId();

    return this.api
      .get<DesignationLookupApi[] | { data?: DesignationLookupApi[]; Data?: DesignationLookupApi[] }>(
        '/api/centralizedAPI/SOPDesignation',
        { params: { tenantId } },
      )
      .pipe(
        map((response) => {
          // API can return direct array or wrapped data.
          const designations = Array.isArray(response)
            ? response
            : response.data ?? response.Data ?? [];

          // Convert API data into dropdown options.
          return designations.map((designation) => this.toOption(designation));
        }),
        // Empty fallback keeps forms stable if API/CORS/network is temporarily unavailable.
        catchError(() => of([] as DesignationLookupOption[])),
      );
  }

  private toOption(designation: DesignationLookupApi): DesignationLookupOption {
    // Keep only the fields needed by the dropdown.
    return {
      designationId: designation.IDDesignation,
      name: designation.Name,
    };
  }
}
