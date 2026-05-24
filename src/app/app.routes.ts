import { Routes } from '@angular/router';

import { LayoutComponent } from './shell/layout/layout';

// Enterprise routing structure:
// - The shell layout is loaded once at the root.
// - Feature pages are loaded inside the shell through child routes.
// - loadComponent keeps the dashboard lazy-load-ready without NgModules.
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((component) => component.DashboardComponent),
      },
      {
        path: 'organization',
        loadChildren: () =>
          import('./features/organization/organization.routes').then((feature) => feature.organizationRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
