import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Cliente } from '../cliente';
import { ClienteService } from '../cliente.service';
import { ModalService } from './modal.service';
import swal from 'sweetalert2';
import { Venta } from 'src/app/ventas/models/venta';
import { VentaService } from 'src/app/ventas/services/venta.service';
import Swal from 'sweetalert2';
import { apiUrl } from '../../core/api-url';
import { LoginService } from '../../login/login.service';

@Component({
  selector: 'detalle-cliente',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent implements OnChanges {
  @Input() cliente: Cliente;
  titulo = 'Detalle del cliente';
  fotoSeleccionada: File;

  movimientos: Venta[] = [];
  desde = new Date(new Date().getFullYear() - 5, 0, 1).toISOString().substring(0, 10);
  hasta = new Date().toISOString().substring(0, 10);
  tipoFiltro: 'TODOS' | 'INGRESO' | 'EGRESO' = 'TODOS';
  cargandoMov = false;

  constructor(
    private clienteService: ClienteService,
    private ventaService: VentaService,
    public modalService: ModalService,
    public loginService: LoginService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente'] && this.cliente?.id) {
      this.cargarMovimientos();
    }
  }

  cargarMovimientos(): void {
    if (!this.cliente?.id) {
      return;
    }
    this.cargandoMov = true;
    const tipo = this.tipoFiltro === 'TODOS' ? undefined : this.tipoFiltro;
    this.ventaService.getVentasPorCliente(this.cliente.id, this.desde, this.hasta, tipo).subscribe({
      next: list => {
        this.movimientos = list || [];
        this.cargandoMov = false;
      },
      error: () => {
        this.movimientos = [];
        this.cargandoMov = false;
      }
    });
  }

  esEgreso(v: Venta): boolean {
    return String(v?.tipo || '').toUpperCase() === 'EGRESO';
  }

  fotoUrl(): string {
    if (this.cliente?.foto) {
      return apiUrl('/api/uploads/img/' + this.cliente.foto);
    }
    return 'assets/img/cliente-placeholder.svg';
  }

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (file.type.indexOf('image') < 0) {
      swal.fire('Archivo no válido', 'Seleccione una imagen.', 'error');
      this.fotoSeleccionada = null;
      return;
    }
    this.fotoSeleccionada = file;
  }

  subirFoto(): void {
    if (!this.fotoSeleccionada) {
      swal.fire('Atención', 'Seleccione una foto primero.', 'error');
      return;
    }
    this.clienteService.subirFoto(this.fotoSeleccionada, this.cliente.id).subscribe(cliente => {
      this.cliente = cliente;
      swal.fire('Listo', 'La foto se actualizó correctamente.', 'success');
    });
  }

  cerrarModal(): void {
    this.modalService.cerrarModal();
    this.fotoSeleccionada = null;
  }

  delete(venta: Venta): void {
    Swal.fire({
      title: `¿Eliminar el movimiento #${venta.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.ventaService.delete(venta.id).subscribe({
          next: () => {
            this.movimientos = (this.movimientos || []).filter(v => v.id !== venta.id);
            Swal.fire('Eliminado', 'El movimiento se eliminó.', 'success');
          },
          error: err => {
            const m = err?.error?.mensaje || 'No se pudo eliminar';
            Swal.fire('Error', m, 'error');
          }
        });
      }
    });
  }
}
