import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly currentUserSignal = signal<User | null>(null);
  private readonly isAuthenticatedSignal = signal<boolean>(false);

  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/users';
  private readonly mockPassword = 'password123'; // default password for demo

  constructor() {
    this.initializeAuth();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private safeSetItem(key: string, value: string): void {
    if (this.isBrowser() && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private safeGetItem(key: string): string | null {
    if (this.isBrowser() && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  private safeRemoveItem(key: string): void {
    if (this.isBrowser() && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    } else {
      this.currentUserSignal.set(null);
      this.isAuthenticatedSignal.set(false);
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map(users => {
        const input = credentials.username.toLowerCase();
        const user = users.find(u =>
          u.username.toLowerCase() === input || u.email.toLowerCase() === input
        );

        if (user && credentials.password === this.mockPassword) {
          const token = this.generateMockToken();
          const authResponse: AuthResponse = { token, user };

          this.setToken(token);
          this.setUser(user);
          this.currentUserSignal.set(user);
          this.isAuthenticatedSignal.set(true);

          return authResponse;
        } else {
          throw new Error('Invalid username/email or password');
        }
      }),
      catchError(err => throwError(() => new Error(err.message || 'Login failed')))
    );
  }
  logout(): void {
    this.safeRemoveItem('auth_token');
    this.safeRemoveItem('auth_user');
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);

    if (this.isBrowser()) {
      try {
        this.router.navigate(['/login']);
      } catch {}
    }
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  getToken(): string | null {
    return this.safeGetItem('auth_token');
  }

  private setToken(token: string): void {
    this.safeSetItem('auth_token', token);
  }

  private setUser(user: User): void {
    try {
      this.safeSetItem('auth_user', JSON.stringify(user));
    } catch {}
  }

  private getStoredUser(): User | null {
    const userStr = this.safeGetItem('auth_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  private generateMockToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: '1234567890',
      name: 'Demo User',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    }));
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
  }
}
