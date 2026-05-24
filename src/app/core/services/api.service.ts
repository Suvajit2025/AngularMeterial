import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';

// Central API wrapper used by feature services.
// Enterprise apps keep HTTP logic here to avoid repeated code across features.
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(this.buildUrl(url)).pipe(catchError(this.handleError));
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.buildUrl(url), body).pipe(catchError(this.handleError));
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.buildUrl(url), body).pipe(catchError(this.handleError));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(url)).pipe(catchError(this.handleError));
  }

  private buildUrl(url: string): string {
    return `${this.apiBaseUrl}/${url.replace(/^\/+/, '')}`;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // RxJS Observable used for API error stream handling.
    return throwError(() => error);
  }
}
