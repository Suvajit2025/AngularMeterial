import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { AUTH_TOKEN_STORAGE } from '../tokens/auth-token.storage';
import { ApiService } from './api.service';

interface LoginRequest {
  userName: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

// JWT-ready authentication service.
// Real login endpoints can replace this shape without changing the interceptor.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(AUTH_TOKEN_STORAGE);
  private readonly tokenKey = 'enterprise_hrms_access_token';

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('auth/login', request).pipe(
      tap((response) => this.setAccessToken(response.accessToken)),
    );
  }

  getAccessToken(): string | null {
    return this.storage.getItem(this.tokenKey);
  }

  setAccessToken(token: string): void {
    this.storage.setItem(this.tokenKey, token);
  }

  logout(): void {
    this.storage.removeItem(this.tokenKey);
  }
}
