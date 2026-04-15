import { Component, OnInit } from '@angular/core';
import { Venta } from './models/venta';
import { VentaService } from './services/venta.service';
import { LoginService } from '../login/login.service';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-movimientos-lista',
  templateUrl: './movimientos-lista.component.html',
  styleUrls: ['./movimientos-lista.component.css']
})
export class MovimientosListaComponent implements OnInit {
  desde = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10);
  hasta = new Date().toISOString().substring(0, 10);
  /** TODOS | INGRESO | EGRESO */
  tipoFiltro: 'TODOS' | 'INGRESO' | 'EGRESO' = 'TODOS';
  movimientos: Venta[] = [];
  cargando = false;

  constructor(
    private ventaService: VentaService,
    public loginService: LoginService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.refrescar();
  }

  refrescar(): void {
    this.cargando = true;
    const tipo = this.tipoFiltro === 'TODOS' ? undefined : this.tipoFiltro;
    this.ventaService.listarMovimientos(this.desde, this.hasta, tipo).subscribe({
      next: list => {
        this.movimientos = list || [];
        this.cargando = false;
      },
      error: () => {
        this.movimientos = [];
        this.cargando = false;
      }
    });
  }

  esEgreso(v: Venta): boolean {
    return String(v?.tipo || '').toUpperCase() === 'EGRESO';
  }

  eliminar(v: Venta): void {
    void Swal.fire({
      title: `¿Eliminar movimiento #${v.id}?`,
      text: 'Quedará marcado como eliminado en el sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) {
        return;
      }
      this.ventaService.delete(v.id).subscribe({
        next: () => {
          void Swal.fire('Listo', 'Movimiento eliminado', 'success');
          this.refrescar();
        },
        error: err => {
          const m = err?.error?.mensaje || 'No se pudo eliminar';
          this.snack.open(m, 'Cerrar', { duration: 5000 });
        }
      });
    });
  }
}
