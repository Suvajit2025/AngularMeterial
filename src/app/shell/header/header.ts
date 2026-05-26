import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

import { AuthService, UserDetailsResponse } from '../../core/services/auth.service';
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Input signal receives sidebar state from LayoutComponent.
  readonly sidebarCollapsed = input(false);

  // Output event tells LayoutComponent that the hamburger button was clicked.
  readonly sidebarToggle = output<void>();

  // Signal used for local UI state. Search text does not need RxJS because it is not an API stream.
  protected readonly searchText = signal('');

  // Signal used for notification count so the badge updates immediately when value changes.
  protected readonly notificationCount = signal(8);

  protected readonly user = signal<UserProfile>(this.createUserProfile());

  protected readonly notificationLabel = computed(
    () => `${this.notificationCount()} pending notifications`,
  );

  protected toggleSidebar(): void {
    // Emit event upward instead of directly controlling the parent component.
    this.sidebarToggle.emit();
  }

  protected openProfile(): void {
    void this.router.navigateByUrl('/profile');
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }

  private createUserProfile(): UserProfile {
    const details = this.authService.getUserSession()?.userDetails?.[0];
    const name = details?.Name || 'User Profile';

    return {
      id: details?.EmpNo || 0,
      name,
      role: details?.RoleName || details?.DesignationName || 'HRMS User',
      initials: this.getInitials(name),
      avatarUrl: details ? this.getAvatarUrl(details) : this.getFallbackAvatarUrl(name),
    };
  }

  private getAvatarUrl(details: UserDetailsResponse): string {
    if (
      typeof details.Data === 'string' &&
      details.Data.trim() &&
      typeof details.Contenttype === 'string' &&
      details.Contenttype.trim()
    ) {
      return `data:${details.Contenttype};base64,${details.Data}`;
    }

    return this.getFallbackAvatarUrl(details.Name || 'User Profile');
  }

  private getFallbackAvatarUrl(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name,
    )}&background=dbeafe&color=1d4ed8&bold=true`;
  }

  private getInitials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}
