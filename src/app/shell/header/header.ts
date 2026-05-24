import { Component, computed, input, output, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { UserProfile } from '../models/user-profile.model';

// HeaderComponent contains the enterprise top navbar:
// menu toggle, brand, global search, notification badge, and user menu.
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatToolbarModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  // Input signal receives sidebar state from LayoutComponent.
  readonly sidebarCollapsed = input(false);

  // Output event tells LayoutComponent that the hamburger button was clicked.
  readonly sidebarToggle = output<void>();

  // Signal used for local UI state. Search text does not need RxJS because it is not an API stream.
  protected readonly searchText = signal('');

  // Signal used for notification count so the badge updates immediately when value changes.
  protected readonly notificationCount = signal(8);

  // Signal used for current user display. Later this can come from AuthService.
  protected readonly user = signal<UserProfile>({
    id: 1001,
    name: 'Suvajit Das',
    role: 'HRMS Admin',
    initials: 'SD',
  });

  protected readonly notificationLabel = computed(
    () => `${this.notificationCount()} pending notifications`,
  );

  protected toggleSidebar(): void {
    // Emit event upward instead of directly controlling the parent component.
    this.sidebarToggle.emit();
  }
}
