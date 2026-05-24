import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { provideCore } from './core/core.config';
import { routes } from './app.routes';

// Application-level configuration for a standalone Angular app.
// Providers here replace the old NgModule provider pattern.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    // PrimeNG v21 uses provider-based theme configuration instead of old CSS theme files.
    // Aura gives PrimeNG components enterprise-friendly defaults that we refine with SCSS.
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
      },
    }),
    provideRouter(routes),
    provideCore(),
  ]
};
