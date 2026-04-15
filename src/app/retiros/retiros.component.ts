import { Component, OnInit } from '@angular/core';
import { RetiroService } from './retiro.service';
import { Venta } from '../ventas/models/venta';

@Component({
  selector: 'app-retiros',
  templateUrl: './retiros.component.html',
  styleUrls: ['./retiros.component.css']
})
export class RetirosComponent implements OnInit {
  retiros: Venta[] = [];
  paginaActual = 0;
  readonly tamPagina = 6;
  totalPaginas = 1;
  cargando = false;

  constructor(private retiroService: RetiroService) {}

  ngOnInit(): void {
    this.refrescar();
  }

  refrescar(): void {
    this.cargando = true;
    this.retiroService.getRetiros().subscribe({
      next: lista => {
        this.retiros = lista || [];
        this.totalPaginas = Math.max(1, Math.ceil(this.retiros.length / this.tamPagina));
        this.paginaActual = 0;
        this.cargando = false;
      },
      error: () => {
        this.retiros = [];
        this.cargando = false;
      }
    });
  }

  get paginaItems(): Venta[] {
    const inicio = this.paginaActual * this.tamPagina;
    return this.retiros.slice(inicio, inicio + this.tamPagina);
  }

  get indicesPagina(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i);
  }

  irPagina(delta: number): void {
    const siguiente = this.paginaActual + delta;
    if (siguiente < 0 || siguiente >= this.totalPaginas) {
      return;
    }
    this.paginaActual = siguiente;
  }

  irAPagina(n: number): void {
    if (n < 0 || n >= this.totalPaginas) {
      return;
    }
    this.paginaActual = n;
  }
}
