import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

// Reusable shared component example.
// Shared components are UI pieces that multiple features can use.
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyStateComponent {
  // Input signals let parent components pass simple display text.
  readonly icon = input('inbox');
  readonly title = input('No records found');
  readonly message = input('Try changing filters or add a new record.');
}
