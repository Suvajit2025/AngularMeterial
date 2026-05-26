import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';

import { AUTH_TOKEN_STORAGE } from '../tokens/auth-token.storage';
import { environment } from '../../../environments/environment';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface CompanyLoginResponse {
  Truefalse: string;
  Email: string;
  [key: string]: unknown;
}

export interface UserDetailsResponse {
  Name?: string;
  code?: string;
  EmpNo?: number;
  EmpEmail?: string;
  Department?: string;
  RoleName?: string;
  postname?: string;
  DesignationName?: string;
  Imagename?: string | Record<string, never>;
  Contenttype?: string | Record<string, never>;
  Data?: string | Record<string, never>;
  TenantID?: string;
  empcode?: string;
  [key: string]: unknown;
}

export interface OfficialInformation {
  empno: number;
  EmployeeName: string;
  Department: string;
  postname: string;
  designationname: string;
  empgender: string;
  empcategory: string;
  joining: string;
  empdob: string;
  empemail: string;
  empofficialcontactno: string;
  empbloodgroup: string | Record<string, never>;
  empdept: number;
  empdesignation: number;
  emppost: number;
  empcode: string;
  CompanyID: number;
  EmpReporttoperson: string;
  [key: string]: unknown;
}

export interface AuthenticatedUserSession {
  email: string;
  companyId: number;
  login: CompanyLoginResponse;
  userDetails: UserDetailsResponse[];
}

// JWT-ready authentication service.
// Real login endpoints can replace this shape without changing the interceptor.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(AUTH_TOKEN_STORAGE);
  private readonly tokenKey = 'enterprise_hrms_access_token';
  private readonly sessionKey = 'enterprise_hrms_user_session';
  // This key is used to save and read tenant id from local storage.
  private readonly tenantIdKey = 'tenantId';
  private readonly companyId = 24;
  private readonly loginUrl = '/sales-api/api/Emp/companyidlogin';

  login(request: LoginRequest): Observable<AuthenticatedUserSession> {
    const loginParams = new HttpParams()
      .set('username', request.email)
      .set('password', request.password)
      .set('id', this.companyId);

    return this.http
      .post<CompanyLoginResponse[]>(this.loginUrl, null, { params: loginParams })
      .pipe(
        switchMap((response) => {
          const loginResult = response[0];

          if (
            !loginResult ||
            loginResult.Truefalse === 'False' ||
            loginResult.Email?.toLowerCase() !== request.email.toLowerCase()
          ) {
            throw new Error('Invalid credentials');
          }

          const userDetailsParams = new HttpParams()
            .set('companyId', this.companyId)
            .set('Email', request.email);

          return this.http
            .get<UserDetailsResponse[]>(`${environment.apiBaseUrl}/api/centralizedAPI/UserDetails`, {
              params: userDetailsParams,
            })
            .pipe(
              tap((userDetails) =>
                this.persistLoginSession(request, {
                  email: request.email,
                  companyId: this.companyId,
                  login: loginResult,
                  userDetails,
                }),
              ),
              map((userDetails) => ({
                email: request.email,
                companyId: this.companyId,
                login: loginResult,
                userDetails,
              })),
            );
        }),
        catchError((error) => throwError(() => this.createLoginError(error))),
      );
  }

  getRememberedCredentials(): { email: string; password: string; rememberMe: boolean } {
    const rememberMe = this.storage.getItem('rememberMe') === 'true';

    return {
      email: rememberMe ? this.storage.getItem('rememberedEmail') || '' : '',
      password: rememberMe ? this.storage.getItem('rememberedPassword') || '' : '',
      rememberMe,
    };
  }

  getUserSession(): AuthenticatedUserSession | null {
    const session = this.storage.getItem(this.sessionKey);

    if (!session) {
      return null;
    }

    try {
      return JSON.parse(session) as AuthenticatedUserSession;
    } catch {
      this.storage.removeItem(this.sessionKey);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const session = this.getUserSession();
    const details = session?.userDetails?.[0];

    return Boolean(session?.email && details?.EmpNo && details?.TenantID);
  }

  private persistLoginSession(request: LoginRequest, session: AuthenticatedUserSession): void {
    // Tenant id comes from user details after login.
    const tenantId = session.userDetails?.[0]?.TenantID;

    // Save basic login data in local storage.
    this.storage.setItem('email', request.email);
    this.storage.setItem('password', request.password);
    this.storage.setItem('companyId', this.companyId.toString());
    this.storage.setItem(this.sessionKey, JSON.stringify(session));

    // Save tenant id separately so all lookup services can use it.
    if (tenantId) {
      this.storage.setItem(this.tenantIdKey, tenantId);
    }

    if (request.rememberMe) {
      this.storage.setItem('rememberMe', 'true');
      this.storage.setItem('rememberedEmail', request.email);
      this.storage.setItem('rememberedPassword', request.password);
      return;
    }

    this.storage.setItem('rememberMe', 'false');
    this.storage.removeItem('rememberedEmail');
    this.storage.removeItem('rememberedPassword');
  }

  getCompanyId(): number {
    return this.companyId;
  }

  getTenantId(): string {
    // Return tenant id from local storage.
    return this.storage.getItem(this.tenantIdKey) || '';
  }

  getUserDetails(email: string): Observable<UserDetailsResponse[]> {
    const params = new HttpParams().set('companyId', this.companyId).set('Email', email);

    return this.http.get<UserDetailsResponse[]>(`${environment.apiBaseUrl}/api/centralizedAPI/UserDetails`, {
      params,
    });
  }

  getOfficialInformation(tenantId: string, empNo: number): Observable<OfficialInformation[]> {
    const params = new HttpParams().set('TenantId', tenantId).set('empNo', empNo);

    return this.http.get<OfficialInformation[]>(
      `${environment.apiBaseUrl}/api/centralizedAPI/ViewOfficialInformation`,
      { params },
    );
  }

  getAccessToken(): string | null {
    return this.storage.getItem(this.tokenKey);
  }

  setAccessToken(token: string): void {
    this.storage.setItem(this.tokenKey, token);
  }

  logout(): void {
    // Clear all login related data from local storage.
    this.storage.removeItem(this.tokenKey);
    this.storage.removeItem(this.sessionKey);
    this.storage.removeItem('email');
    this.storage.removeItem('password');
    this.storage.removeItem('companyId');
    this.storage.removeItem(this.tenantIdKey);
  }

  private createLoginError(error: unknown): Error {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return new Error(
          'Cannot reach login API. Check network access or CORS/proxy configuration for salesapi.mendine.co.in.',
        );
      }

      const apiMessage =
        typeof error.error === 'string'
          ? error.error
          : error.error?.message || error.error?.Message || error.message;

      return new Error(`Login API failed (${error.status}): ${apiMessage}`);
    }

    return new Error('Login failed. Please try again.');
  }
}
