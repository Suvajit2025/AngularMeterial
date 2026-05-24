import { Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

import { PostLookupOption } from '../../../core/models/post-lookup.model';
import { PostLookupService } from '../../../core/services/post-lookup.service';

@Component({
  selector: 'app-post-multiselect',
  imports: [FormsModule, MultiSelectModule],
  templateUrl: './post-multiselect.html',
  styleUrl: './post-multiselect.scss',
})
export class PostMultiselectComponent {
  private readonly postLookupService = inject(PostLookupService);

  // Output emits all selected posts to the parent form/page.
  readonly selectionChanged = output<PostLookupOption[]>();

  // Signal stores selected posts. PrimeNG handles search, overlay, checkbox, and virtual scroll.
  protected readonly selectedPosts = signal<PostLookupOption[]>([]);

  protected readonly posts = toSignal(this.postLookupService.getPosts(), {
    initialValue: [] as PostLookupOption[],
  });

  protected selectPosts(posts: PostLookupOption[] | null): void {
    const selected = posts ?? [];
    this.selectedPosts.set(selected);
    this.selectionChanged.emit(selected);
  }
}
