import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export class ApiError extends Error {
  constructor(readonly status: number, cause: HttpErrorResponse) {
    super('No se pudo completar la solicitud.', { cause });
    this.name = 'ApiError';
  }
}

export const apiInterceptor: HttpInterceptorFn = (request, next) =>
  next(request.headers.has('Accept')
    ? request
    : request.clone({ setHeaders: { Accept: 'application/json' } }),
  ).pipe(
    catchError((error: unknown) =>
      throwError(() => error instanceof HttpErrorResponse
        ? new ApiError(error.status, error)
        : error),
    ),
  );
