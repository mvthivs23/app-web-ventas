import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/api-url';

export interface UsuarioAdmin {
  id: number;
  username: string;
  nombre?: string;
  enabled?: boolean;
  rol?: string;
}

export interface AdminUsuarioCreate {
  username: string;
  password: string;
  rol?: string;
}

export interface AdminUsuarioUpdate {
  username?: string;
  password?: string;
  enabled?: boolean;
  rol?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsuarioService {
  private readonly base = () => apiUrl('/api/admin/usuarios');

  constructor(private http: HttpClient) {}

  listar(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.base());
  }

  crear(body: AdminUsuarioCreate): Observable<any> {
    return this.http.post(this.base(), body);
  }

  actualizar(id: number, body: AdminUsuarioUpdate): Observable<UsuarioAdmin> {
    return this.http.put<UsuarioAdmin>(`${this.base()}/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`);
  }
}
