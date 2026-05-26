import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { PostLookupApi, PostLookupOption } from '../models/post-lookup.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PostLookupService {
  // ApiService is used for calling backend APIs.
  private readonly api = inject(ApiService);

  // AuthService gives tenant id from local storage.
  private readonly authService = inject(AuthService);

  // Post lookup data is shared across forms, so cache the first API response.
  private readonly posts$ = this.loadPosts().pipe(shareReplay({ bufferSize: 1, refCount: true }));

  getPosts(): Observable<PostLookupOption[]> {
    // RxJS Observable is used because post data comes from an API.
    return this.posts$;
  }

  private loadPosts(): Observable<PostLookupOption[]> {
    // Get tenant id from local storage before calling the API.
    const tenantId = this.authService.getTenantId();

    return this.api
      .get<PostLookupApi[] | { data?: PostLookupApi[]; Data?: PostLookupApi[] }>(
        '/api/centralizedAPI/SOPPostList',
        { params: { tenantId } },
      )
      .pipe(
        map((response) => {
          // API can return direct array or wrapped data.
          const posts = Array.isArray(response)
            ? response
            : response.data ?? response.Data ?? [];

          // Convert API data into dropdown options.
          return posts.map((post) => this.toOption(post));
        }),
        // Empty fallback keeps forms stable if API/CORS/network is temporarily unavailable.
        catchError(() => of([] as PostLookupOption[])),
      );
  }

  private toOption(post: PostLookupApi): PostLookupOption {
    // Keep only the fields needed by the dropdown.
    return {
      postId: post.IDPost,
      name: post.Name,
    };
  }
}
