import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { LoginService } from '../login/login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.loginService.isLoggedIn()) {
      return true;
    }
    return this.router.parseUrl('/login');
  }
}
