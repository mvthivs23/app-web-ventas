import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta } from '../models/venta';
import { Producto } from '../models/producto';
import { apiUrl } from '../../core/api-url';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private readonly base = () => apiUrl('/api/ventas');

  constructor(private http: HttpClient) {}

  listarMovimientos(desde: string, hasta: string, tipo?: string, clienteId?: number): Observable<Venta[]> {
    let q = `desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`;
    if (tipo && tipo !== 'TODOS') {
      q += `&tipo=${encodeURIComponent(tipo)}`;
    }
    if (clienteId != null) {
      q += `&clienteId=${clienteId}`;
    }
    return this.http.get<Venta[]>(apiUrl(`/api/movimientos?${q}`));
  }

  getVentasPorCliente(clienteId: number, desde: string, hasta: string, tipo?: string): Observable<Venta[]> {
    let q = `desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`;
    if (tipo && tipo !== 'TODOS') {
      q += `&tipo=${encodeURIComponent(tipo)}`;
    }
    return this.http.get<Venta[]>(apiUrl(`/api/clientes/${clienteId}/ventas?${q}`));
  }

  getVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.base()}/${id}`);
  }

  update(id: number, venta: Venta): Observable<Venta> {
    return this.http.put<Venta>(`${this.base()}/${id}`, venta);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`);
  }

  descargarReportePdf(desde: string, hasta: string, tipo?: string): Observable<Blob> {
    let q = `desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`;
    if (tipo && tipo !== 'TODOS') {
      q += `&tipo=${encodeURIComponent(tipo)}`;
    }
    return this.http.get(apiUrl(`/api/reportes/ventas.pdf?${q}`), { responseType: 'blob' });
  }

  filtrarProductos(term: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.base()}/filtrar-productos/${term}`);
  }

  create(venta: Venta): Observable<Venta> {
    return this.http.post<Venta>(this.base(), venta);
  }

  getRetirosExcedente(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.base()}/retiros`);
  }

  getMetricas(desde: string, hasta: string): Observable<any> {
    return this.http.get<any>(apiUrl(`/api/reportes/metricas?desde=${desde}&hasta=${hasta}`));
  }

  getReporteVentas(desde: string, hasta: string): Observable<any> {
    return this.http.get<any>(apiUrl(`/api/reportes/ventas?desde=${desde}&hasta=${hasta}`));
  }

  getMaterialRecicladoPorMes(): Observable<any[]> {
    return this.http.get<any[]>(apiUrl('/api/reportes/material-mes'));
  }
}
