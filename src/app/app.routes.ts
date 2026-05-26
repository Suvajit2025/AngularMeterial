import { Type } from '@angular/core';
import { Routes } from '@angular/router';

import { LayoutComponent } from './shell/layout/layout';
import { MenuItem } from './shell/models/menu-item.model';
import { ENTERPRISE_MENU_ITEMS } from './shell/models/menu.mock';
import { AUTH_ROUTES } from './features/auth/auth.routes';

type MenuComponentLoader = () => Promise<Type<unknown>>;

const implementedMenuComponents: Partial<Record<string, MenuComponentLoader>> = {
  dashboard: () =>
    import('./features/dashboard/dashboard').then((component) => component.DashboardComponent),
  'organization/org-chart': () =>
    import('./features/organization/org-chart/org-chart').then(
      (component) => component.OrgChartComponent,
    ),
  profile: () => import('./features/profile/profile').then((component) => component.ProfileComponent),
};

function normalizeRoutePath(route: string): string {
  return route.replace(/^\/+|\/+$/g, '');
}

function createRoutesFromMenu(items: MenuItem[], parentTitle = ''): Routes {
  return items.flatMap((item) => {
    const routes: Routes = [];

    if (!item.hidden && item.route) {
      const path = normalizeRoutePath(item.route);
      const loadComponent = implementedMenuComponents[path];

      if (path && loadComponent) {
        routes.push({
          path,
          loadComponent,
          data: {
            icon: item.icon,
            section: parentTitle,
            title: item.title,
          },
        });
      }
    }

    if (!item.hidden && item.children?.length) {
      routes.push(...createRoutesFromMenu(item.children, item.title));
    }

    return routes;
  });
}

// Enterprise routing structure:
// - The shell layout is loaded once at the root.
// - Sidebar leaf routes are generated from menu data so navigation stays in one source.
// - Implemented menu pages are lazy loaded; unfinished pages use a shared placeholder.
export const routes: Routes = [
  ...AUTH_ROUTES,
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
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile').then((component) => component.ProfileComponent),
        data: {
          icon: 'person',
          title: 'Profile',
        },
      },
      ...createRoutesFromMenu(ENTERPRISE_MENU_ITEMS),
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
