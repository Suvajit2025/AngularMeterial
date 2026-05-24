import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

import { FooterComponent } from '../footer/footer';
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';

// LayoutComponent is the enterprise application shell.
// It owns responsive sidebar behavior and hosts all feature pages through router-outlet.
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, RouterOutlet, SidebarComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Signal used for sidebar collapse state management.
  protected readonly isCollapsed = signal(false);

  // RxJS observes screen size changes; toSignal converts the stream into a signal for the template.
  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 767px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  // Computed signals derive layout values from the current screen/sidebar state.
  protected toggleSidebar(): void {
    // update() is the simplest way to change a signal based on its previous value.
    this.isCollapsed.update((collapsed) => !collapsed);
  }
}
