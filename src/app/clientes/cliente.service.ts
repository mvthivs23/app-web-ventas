import { Injectable } from '@angular/core';
import { Cliente } from './cliente';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { apiUrl } from '../core/api-url';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly base = () => apiUrl('/api/clientes');
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient, private router: Router) {}

  buscar(term: string): Observable<Cliente[]> {
    const q = encodeURIComponent((term || '').trim());
    return this.http.get<Cliente[]>(`${this.base()}/buscar?term=${q}`);
  }

  getClientes(page: number): Observable<any> {
    return this.http.get(this.base() + '/page/' + page).pipe(
      map((response: any) => {
        (response.content as Cliente[]).map(cliente => {
          cliente.nombre = cliente.nombre.toUpperCase();
          return cliente;
        });
        return response;
      })
    );
  }

  create(cliente: Cliente): Observable<any> {
    return this.http.post<any>(this.base(), cliente, { headers: this.httpHeaders }).pipe(
      catchError(e => {
        if (e.status == 400) {
          return throwError(() => e);
        }
        console.error(e.error?.mensaje);
        swal.fire('Error al crear al cliente', e.error?.mensaje || 'Error', 'error');
        return throwError(() => e);
      })
    );
  }

  getCliente(id): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.base()}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/clientes']);
        console.error(e.error?.mensaje);
        swal.fire('Error al editar', e.error?.mensaje || 'Error', 'error');
        return throwError(() => e);
      })
    );
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.base()}/${id}`);
  }

  update(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.base()}/${cliente.id}`, cliente, { headers: this.httpHeaders }).pipe(
      catchError(e => {
        if (e.status == 400) {
          return throwError(() => e);
        }
        console.error(e.error?.mensaje);
        swal.fire('Error al eliminar cliente', e.error?.mensaje || 'Error', 'error');
        return throwError(() => e);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`);
  }

  subirFoto(archivo: File, id): Observable<Cliente> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('id', id);

    return this.http.post(`${this.base()}/upload`, formData).pipe(
      map((response: any) => response.cliente as Cliente),
      catchError(e => {
        console.error(e.error?.mensaje);
        swal.fire(e.error?.mensaje, e.error?.error, 'error');
        return throwError(() => e);
      })
    );
  }
}
