import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

// Central error interceptor for logging and future toast notifications.
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('API error', {
        url: request.url,
        status: error.status,
        message: error.message,
      });

      return throwError(() => error);
    }),
  );
};
