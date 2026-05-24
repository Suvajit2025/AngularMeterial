import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PostLookupApi, PostLookupOption } from '../models/post-lookup.model';

@Injectable({ providedIn: 'root' })
export class PostLookupService {
  private readonly http = inject(HttpClient);

  private readonly postListUrl = `${environment.apiBaseUrl}/api/centralizedAPI/SOPPostList`;

  private readonly tenantId = environment.tenantId;

  // Post lookup data is shared across forms, so cache the first API response.
  private readonly posts$ = this.loadPosts().pipe(shareReplay({ bufferSize: 1, refCount: true }));

  getPosts(): Observable<PostLookupOption[]> {
    // RxJS Observable is used because post data comes from an API.
    return this.posts$;
  }

  private loadPosts(): Observable<PostLookupOption[]> {
    const params = new HttpParams().set('tenantId', this.tenantId);

    return this.http
      .get<PostLookupApi[] | { data?: PostLookupApi[]; Data?: PostLookupApi[] }>(
        this.postListUrl,
        { params },
      )
      .pipe(
        map((response) => {
          const posts = Array.isArray(response)
            ? response
            : response.data ?? response.Data ?? [];

          return posts.map((post) => this.toOption(post));
        }),
        // Empty fallback keeps forms stable if API/CORS/network is temporarily unavailable.
        catchError(() => of([] as PostLookupOption[])),
      );
  }

  private toOption(post: PostLookupApi): PostLookupOption {
    return {
      postId: post.IDPost,
      name: post.Name,
    };
  }
}
