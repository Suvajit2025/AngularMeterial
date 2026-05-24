import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingState } from '../state/loading.state';

// Loading interceptor updates a signal while HTTP requests are running.
export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loadingState = inject(LoadingState);

  loadingState.start();

  return next(request).pipe(finalize(() => loadingState.stop()));
};
