import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/api-url';
import { Venta } from '../ventas/models/venta';

@Injectable({ providedIn: 'root' })
export class RetiroService {
  constructor(private http: HttpClient) {}

  getRetiros(): Observable<Venta[]> {
    return this.http.get<Venta[]>(apiUrl('/api/ventas/retiros'));
  }
}
