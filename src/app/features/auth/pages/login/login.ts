import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly logoUrl =
    'https://iehrms.iecsl.in/Register/IehrmsLogin/img/ie-hrms-logo.png';
  protected readonly workforceImageUrl =
    'https://iehrms.iecsl.in/Register/IehrmsLogin/img/Group-01.png';

  protected readonly userName = signal('');
  protected readonly password = signal('');
  protected readonly rememberMe = signal(this.authService.getRememberedCredentials().rememberMe);
  protected readonly showPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    const rememberedCredentials = this.authService.getRememberedCredentials();

    this.userName.set(rememberedCredentials.email);
    this.password.set(rememberedCredentials.password);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((isVisible) => !isVisible);
  }

  protected async handleLogin(): Promise<void> {
    const email = this.userName().trim();
    const password = this.password();

    this.errorMessage.set('');

    if (!email) {
      window.alert('Email cannot be empty');
      return;
    }

    if (!password) {
      window.alert('Password cannot be empty');
      return;
    }

    this.isLoading.set(true);

    try {
      await firstValueFrom(
        this.authService.login({
          email,
          password,
          rememberMe: this.rememberMe(),
        }),
      );

      await this.router.navigateByUrl(this.getReturnUrl());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      this.errorMessage.set(message);
      window.alert(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  private getReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (!returnUrl || returnUrl === '/login' || !returnUrl.startsWith('/')) {
      return '/dashboard';
    }

    return returnUrl;
  }
}
