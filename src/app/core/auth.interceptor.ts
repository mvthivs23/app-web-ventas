import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '../login/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    const token = this.loginService.getToken();
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        const url = req.url;
        const isAuth = url.includes('/generate-token');
        if (err.status === 401 && !isAuth && this.loginService.isLoggedIn()) {
          this.loginService.logout();
          void this.router.navigate(['/login'], { queryParams: { sesion: 'expirada' } });
        }
        return throwError(() => err);
      })
    );
  }
}
