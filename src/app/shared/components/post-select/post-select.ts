import { Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { PostLookupOption } from '../../../core/models/post-lookup.model';
import { PostLookupService } from '../../../core/services/post-lookup.service';

@Component({
  selector: 'app-post-select',
  standalone: true,
  imports: [FormsModule, SelectModule],
  templateUrl: './post-select.html',
  styleUrl: './post-select.scss',
})
export class PostSelectComponent {
  private readonly postLookupService = inject(PostLookupService);

  // Output emits the selected post object to the parent form/page.
  readonly postSelected = output<PostLookupOption | null>();

  // Signal stores selected post object for PrimeNG binding.
  protected readonly selectedPost = signal<PostLookupOption | null>(null);

  // Convert API Observable into a Signal for clean template binding.
  protected readonly posts = toSignal(this.postLookupService.getPosts(), {
    initialValue: [] as PostLookupOption[],
  });

  protected selectPost(post: PostLookupOption | null): void {
    this.selectedPost.set(post);
    this.postSelected.emit(post);
  }
}
