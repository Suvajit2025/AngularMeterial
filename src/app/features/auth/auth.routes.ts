import { Routes } from '@angular/router';

import { publicOnlyGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [publicOnlyGuard],
    loadComponent: () => import('./pages/login/login').then((component) => component.LoginComponent),
  },
];
