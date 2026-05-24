import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';

// Core providers are registered once at application startup.
// This keeps app.config.ts clean as the enterprise app grows.
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])),
  ]);
}
