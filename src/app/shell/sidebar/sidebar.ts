import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ENTERPRISE_MENU_ITEMS } from '../models/menu.mock';
import { MenuItem } from '../models/menu-item.model';

// SidebarComponent renders API-ready menu data using a recursive template.
// This is easier to understand and avoids nested tree alignment problems for beginners.
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
  // Input signal tells sidebar whether it should show compact icon-only mode.
  readonly collapsed = input(false);

  // Signal holds mock menu data today. Later an API service can replace this value.
  protected readonly menuItems = signal<MenuItem[]>(ENTERPRISE_MENU_ITEMS);

  // Signal stores expanded parent menu ids. Set is used for fast lookup.
  protected readonly expandedNodeIds = signal<ReadonlySet<number>>(new Set([1]));

  // Computed signal is useful when filters/permissions are added later.
  protected readonly visibleMenuItems = computed(() => this.menuItems());

  protected hasChildren(item: MenuItem): boolean {
    return Boolean(item.children?.length);
  }

  protected isExpanded(item: MenuItem): boolean {
    return this.expandedNodeIds().has(item.id);
  }

  protected menuIndent(level: number): number {
    return this.collapsed() ? 0 : 12 + level * 18;
  }

  protected toggleNode(item: MenuItem): void {
    // Enterprise menus are often permission-driven; storing ids keeps state separate from data.
    this.expandedNodeIds.update((current) => {
      // Create new Set for immutability
      const next = new Set<number>();
      // If already expanded → collapse it
      if (current.has(item.id)) { return next; }
      // Otherwise: 
      // clear all previous expanded nodes 
      //  and expand only current node

      next.add(item.id);
      return next;
    });
  }
}
