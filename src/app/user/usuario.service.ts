import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrl } from '../core/api-url';

export interface RegistroUsuarioPayload {
  username: string;
  password: string;
  rol: 'NORMAL' | 'ADMIN';
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private httpClient: HttpClient) {}

  /** Alta de usuario (solo administrador autenticado). */
  public registrar(payload: RegistroUsuarioPayload) {
    return this.httpClient.post(apiUrl('/api/admin/usuarios'), payload);
  }
}
