import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MenuItem } from '../models/menu-item.model';
import { MenuAccessService } from '../services/menu-access.service';

// SidebarComponent shows menu data from permission APIs.
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private readonly menuAccessService = inject(MenuAccessService);

  // Input signal tells sidebar whether it should show compact icon-only mode.
  readonly collapsed = input(false);

  // Signal holds sidebar menu data from permission API.
  protected readonly menuItems = signal<MenuItem[]>([]);

  // Signal shows loading text while module list is coming from API.
  protected readonly loadingModules = signal(true);

  // Signal stores expanded parent menu ids.
  protected readonly expandedNodeIds = signal<ReadonlySet<number>>(new Set());

  // Signal stores selected menu id for highlight.
  protected readonly selectedMenuId = signal<number | null>(null);

  // This keeps the HTML simple.
  protected readonly visibleMenuItems = computed(() => this.menuItems());

  constructor() {
    this.loadModules();
  }

  protected hasChildren(item: MenuItem): boolean {
    // Module rows are parents because their child menus load after click.
    return Boolean(item.moduleName || item.children?.length);
  }

  protected isExpanded(item: MenuItem): boolean {
    return this.expandedNodeIds().has(item.id);
  }

  protected isSelected(item: MenuItem): boolean {
    return this.selectedMenuId() === item.id;
  }

  protected menuIndent(level: number): number {
    return this.collapsed() ? 0 : 12 + level * 18;
  }

  protected toggleNode(item: MenuItem): void {
    const alreadyOpen = this.expandedNodeIds().has(item.id);

    // Close menu when user clicks the already open item.
    if (alreadyOpen) {
      const nextOpenMenus = new Set(this.expandedNodeIds());
      this.removeMenuAndChildren(item, nextOpenMenus);
      this.expandedNodeIds.set(nextOpenMenus);
      return;
    }

    // Open clicked menu and close other menu branches.
    const nextOpenMenus = new Set(this.findParentIds(item.id));
    nextOpenMenus.add(item.id);
    this.expandedNodeIds.set(nextOpenMenus);

    // For module rows, call submenu API only first time.
    if (item.moduleName && !item.loaded && !item.loading) {
      this.loadSubMenus(item);
    }
  }

  protected selectMenu(item: MenuItem): void {
    // Highlight the clicked leaf menu.
    this.selectedMenuId.set(item.id);
  }

  private loadModules(): void {
    // First API call returns allowed modules for logged in user.
    this.menuAccessService.getModules().subscribe((modules) => {
      this.menuItems.set(modules);
      this.loadingModules.set(false);
    });
  }

  private loadSubMenus(item: MenuItem): void {
    // Show loading icon for the clicked module.
    item.loading = true;
    this.refreshMenu();

    this.menuAccessService.getSubMenus(item.moduleName || '').subscribe((children) => {
      // Save children under the clicked module.
      item.children = children.length
        ? this.prepareChildMenus(children, item.id)
        : [this.createNoMenuItem(item.id)];
      item.loaded = true;
      item.loading = false;
      this.refreshMenu();
    });
  }

  private createNoMenuItem(parentId: number): MenuItem {
    // This item is shown when module API returns no child menu.
    return {
      id: parentId + 50000,
      title: 'No menu found',
      icon: 'info',
      disabled: true,
    };
  }

  private refreshMenu(): void {
    // Reset signal value so Angular updates the sidebar after item changes.
    this.menuItems.set([...this.menuItems()]);
  }

  private prepareChildMenus(items: MenuItem[], parentId: number): MenuItem[] {
    // Add parent id and unique id to every child menu.
    return items.map((item, index) => {
      const uniqueId = parentId * 100 + index + 1;

      return {
        ...item,
        id: uniqueId,
        parentId,
        children: item.children ? this.prepareChildMenus(item.children, uniqueId) : undefined,
      };
    });
  }

  private findParentIds(itemId: number): number[] {
    // Find all parent ids of the clicked menu item.
    const parentIds: number[] = [];
    this.findParentIdsFromList(this.menuItems(), itemId, parentIds);
    return parentIds;
  }

  private findParentIdsFromList(items: MenuItem[], itemId: number, parentIds: number[]): boolean {
    for (const item of items) {
      if (item.id === itemId) {
        return true;
      }

      if (item.children?.length && this.findParentIdsFromList(item.children, itemId, parentIds)) {
        parentIds.unshift(item.id);
        return true;
      }
    }

    return false;
  }

  private removeMenuAndChildren(item: MenuItem, openMenus: Set<number>): void {
    // Remove clicked menu and all its child menus from open list.
    openMenus.delete(item.id);

    item.children?.forEach((child) => this.removeMenuAndChildren(child, openMenus));
  }
}
