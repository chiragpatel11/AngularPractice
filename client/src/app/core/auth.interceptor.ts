import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from './session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const token = session.token();
  const authedRequest = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  const isCredentialRequest =
    req.url.endsWith('/auth/login') || req.url.endsWith('/auth/register');

  return next(authedRequest).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isCredentialRequest
      ) {
        session.clear();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
