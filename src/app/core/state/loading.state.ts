import { computed, Injectable, signal } from '@angular/core';

// Simple global loading state used by the loading interceptor.
// A counter is safer than a boolean because multiple API calls can run at the same time.
@Injectable({ providedIn: 'root' })
export class LoadingState {
  private readonly pendingRequests = signal(0);

  // Computed signal automatically updates whenever pendingRequests changes.
  readonly isLoading = computed(() => this.pendingRequests() > 0);

  start(): void {
    this.pendingRequests.update((count) => count + 1);
  }

  stop(): void {
    this.pendingRequests.update((count) => Math.max(0, count - 1));
  }
}
