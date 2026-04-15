import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { apiUrl } from '../core/api-url';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public loginStatusSubjec = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  public generateToken(loginData: { username: string; password: string }) {
    return this.http.post(apiUrl('/generate-token'), loginData);
  }

  public getCurrentUser() {
    return this.http.get(apiUrl('/actual-usuario'));
  }

  public loginUser(token: string) {
    localStorage.setItem('token', token);
    this.loginStatusSubjec.next(true);
    return true;
  }

  public isLoggedIn(): boolean {
    const tokenStr = localStorage.getItem('token');
    return !(tokenStr == undefined || tokenStr === '' || tokenStr == null);
  }

  public logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.loginStatusSubjec.next(false);
    return true;
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public setUser(user: unknown) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Lee el usuario persistido. No debe tener efectos secundarios: antes se llamaba a logout()
   * cuando faltaba "user", lo que borraba el token en cada ciclo de detección del header.
   */
  public getUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr == null || userStr === '') {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  public getUserRole(): string | null {
    const user = this.getUser();
    if (!user) {
      return null;
    }
    if (user.authorities && user.authorities.length) {
      const a = user.authorities[0];
      const auth = typeof a === 'string' ? a : a?.authority;
      if (auth) {
        return auth;
      }
    }
    if (user.usuarioRoles && user.usuarioRoles.length) {
      const ur = user.usuarioRoles[0];
      if (ur?.rol?.nombre) {
        return 'ROLE_' + ur.rol.nombre;
      }
    }
    return 'ROLE_USER';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ROLE_ADMIN';
  }
}
