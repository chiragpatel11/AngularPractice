import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserProfile } from './models';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);

  register(email: string, password: string): Observable<{ accessToken: string }> {
    return this.http
      .post<{ accessToken: string }>(`${environment.apiUrl}/auth/register`, {
        email,
        password,
      })
      .pipe(tap((response) => this.session.setToken(response.accessToken)));
  }

  login(email: string, password: string): Observable<{ accessToken: string }> {
    return this.http
      .post<{ accessToken: string }>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(tap((response) => this.session.setToken(response.accessToken)));
  }

  loadMe(): Observable<UserProfile> {
    return this.http
      .get<UserProfile>(`${environment.apiUrl}/auth/me`)
      .pipe(tap((user) => this.session.setUser(user)));
  }

  logout(): void {
    this.session.clear();
  }
}
