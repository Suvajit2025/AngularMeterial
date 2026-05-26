import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';
import { MenuItem } from '../models/menu-item.model';

interface ModuleAccessApi {
  ModuleName: string;
}

interface MainMenuApi {
  MainMenu: string;
  Main_Menu_Order: number;
}

interface SubMenuApi {
  IDMenu: number;
  MainMenu: string;
  SubMenu: string;
  URL: string;
}

interface SubMenuAccessApi {
  Menu?: MainMenuApi[];
  SubMenu?: SubMenuApi[];
}

@Injectable({ providedIn: 'root' })
export class MenuAccessService {
  // Application id is fixed for this HRMS menu API.
  private readonly applicationId = '2';

  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);

  getModules(): Observable<MenuItem[]> {
    // These values come from login/local storage.
    const tenantId = this.authService.getTenantId();
    const roleId = this.authService.getRoleId();
    const email = this.authService.getUserEmail();

    return this.api
      .get<ModuleAccessApi[]>('/api/user-permission/module-access', {
        params: {
          tenantId,
          IDRole: roleId,
          email,
        },
      })
      .pipe(
        map((modules) => [
          this.createDashboardMenu(),
          ...modules.map((module, index) => this.createModuleMenu(module, index)),
        ]),
        // Empty menu keeps sidebar stable if API fails.
        catchError(() => of([this.createDashboardMenu()])),
      );
  }

  getSubMenus(moduleName: string): Observable<MenuItem[]> {
    // These values come from login/local storage.
    const tenantId = this.authService.getTenantId();
    const roleId = this.authService.getRoleId();

    return this.api
      .get<SubMenuAccessApi[]>('/api/user-permission/submodule-access', {
        params: {
          tenantId,
          IDRole: roleId,
          moduleName,
          IDApplication: this.applicationId,
        },
      })
      .pipe(
        map((response) => this.createSubMenuTree(response)),
        // Empty child menu keeps sidebar stable if API fails.
        catchError(() => of([] as MenuItem[])),
      );
  }

  private createModuleMenu(module: ModuleAccessApi, index: number): MenuItem {
    const moduleName = module.ModuleName.trim();

    // A module is a top level sidebar item.
    return {
      id: 10000 + index,
      title: moduleName,
      icon: this.getModuleIcon(moduleName),
      moduleName,
      children: [],
      loaded: false,
      loading: false,
    };
  }

  private createDashboardMenu(): MenuItem {
    // Dashboard is always the first sidebar menu item.
    return {
      id: 1,
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    };
  }

  private createSubMenuTree(response: SubMenuAccessApi[]): MenuItem[] {
    // API returns Menu and SubMenu in separate objects.
    const mainMenus = response.flatMap((item) => item.Menu || []);
    const subMenus = response.flatMap((item) => item.SubMenu || []);

    // Remove duplicate main menu names like duplicate "My Leave".
    const uniqueMainMenus = mainMenus.filter(
      (menu, index, allMenus) =>
        allMenus.findIndex((item) => item.MainMenu.trim() === menu.MainMenu.trim()) === index,
    );

    // Create one parent menu and attach all matching submenus under it.
    return uniqueMainMenus
      .sort((first, second) => first.Main_Menu_Order - second.Main_Menu_Order)
      .map((mainMenu, index) => this.createMainMenu(mainMenu, subMenus, index));
  }

  private createMainMenu(
    mainMenu: MainMenuApi,
    subMenus: SubMenuApi[],
    index: number,
  ): MenuItem {
    const title = mainMenu.MainMenu.trim();
    const childMenus = subMenus.filter((subMenu) => subMenu.MainMenu.trim() === title);

    // Main menu is the second level in sidebar.
    return {
      id: 20000 + index,
      title,
      icon: 'folder',
      children: childMenus.map((subMenu) => this.createLeafMenu(subMenu)),
      loaded: true,
    };
  }

  private createLeafMenu(subMenu: SubMenuApi): MenuItem {
    const appRoute = this.getAppRoute(subMenu.URL);

    // Leaf menu is the final clickable menu item.
    return {
      id: subMenu.IDMenu,
      title: subMenu.SubMenu.trim(),
      icon: 'chevron_right',
      route: appRoute,
      externalUrl: appRoute ? undefined : this.createExternalUrl(subMenu.URL),
    };
  }

  private getAppRoute(url: string): string | undefined {
    // Some old ASPX pages already have Angular pages in this project.
    const pageUrl = url.replace(/^~\//, '/').toLowerCase();

    if (pageUrl === '/essp/organizationhierarchy.aspx') {
      return '/organization/org-chart';
    }

    if (pageUrl === '/employee_directory/usereditprofile.aspx') {
      return '/profile';
    }

    return undefined;
  }

  private createExternalUrl(url: string): string {
    // API returns old ASPX style paths like ~/ESSP/Form16.aspx.
    if (url.startsWith('~/')) {
      return `${environment.apiBaseUrl}/${url.slice(2)}`;
    }

    return url;
  }

  private getModuleIcon(moduleName: string): string {
    // Simple icons for known module names.
    if (moduleName === 'ESSP') {
      return 'person';
    }

    if (moduleName === 'LMS') {
      return 'event_available';
    }

    if (moduleName === 'ASSET MANAGEMENT') {
      return 'inventory_2';
    }

    return 'apps';
  }
}
