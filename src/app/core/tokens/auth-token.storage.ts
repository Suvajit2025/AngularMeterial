import { InjectionToken } from '@angular/core';

// Injection token keeps browser storage replaceable for testing and SSR.
export const AUTH_TOKEN_STORAGE = new InjectionToken<Storage>('AUTH_TOKEN_STORAGE', {
  providedIn: 'root',
  factory: () => localStorage,
});
