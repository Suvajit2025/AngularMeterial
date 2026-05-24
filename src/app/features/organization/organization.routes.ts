import { Routes } from '@angular/router';

// Feature routes keep Organization screens lazy-load-ready.
// When the user opens /organization, Angular redirects to the real chart page.
export const organizationRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'org-chart',
  },
  {
    path: 'org-chart',
    loadComponent: () => import('./org-chart/org-chart').then((component) => component.OrgChartComponent),
  },
];
