import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/api-url';
import { Producto } from '../ventas/models/producto';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Producto[]> {
    return this.http.get<Producto[]>(apiUrl('/api/productos'));
  }

  crear(body: { nombre: string; precio: number }): Observable<Producto> {
    return this.http.post<Producto>(apiUrl('/api/productos'), body);
  }

  actualizar(id: number, body: { nombre?: string; precio: number }): Observable<Producto> {
    return this.http.put<Producto>(apiUrl(`/api/productos/${id}`), body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`/api/productos/${id}`));
  }
}
