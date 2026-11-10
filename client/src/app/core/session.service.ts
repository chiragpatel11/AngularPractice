import { Injectable, signal } from '@angular/core';
import { UserProfile } from './models';

const TOKEN_KEY = 'accessToken';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<UserProfile | null>(null);

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }

  setUser(user: UserProfile | null): void {
    this.user.set(user);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.token.set(null);
    this.user.set(null);
  }
}
