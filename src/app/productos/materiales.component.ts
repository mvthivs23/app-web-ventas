import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Producto } from '../ventas/models/producto';
import { ProductoService } from './producto.service';
import { LoginService } from '../login/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-materiales',
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.css']
})
export class MaterialesComponent implements OnInit {
  materiales: Producto[] = [];
  cargando = false;
  guardando = false;

  nuevoNombre = '';
  nuevoPrecio: number | null = null;

  constructor(
    private productoService: ProductoService,
    private snack: MatSnackBar,
    public loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.refrescar();
  }

  refrescar(): void {
    this.cargando = true;
    this.productoService.listar().subscribe({
      next: list => {
        this.materiales = list || [];
        this.cargando = false;
      },
      error: () => {
        this.materiales = [];
        this.cargando = false;
        this.snack.open('No se pudieron cargar los materiales', 'Cerrar', { duration: 4000 });
      }
    });
  }

  agregar(): void {
    const nombre = this.nuevoNombre.trim();
    const precio = Number(this.nuevoPrecio);
    if (!nombre) {
      this.snack.open('Indique el nombre del material', 'Cerrar', { duration: 3000 });
      return;
    }
    if (!Number.isFinite(precio) || precio < 0) {
      this.snack.open('Precio por kilo inválido', 'Cerrar', { duration: 3000 });
      return;
    }
    this.guardando = true;
    this.productoService.crear({ nombre, precio }).subscribe({
      next: () => {
        this.nuevoNombre = '';
        this.nuevoPrecio = null;
        this.refrescar();
        this.guardando = false;
        this.snack.open('Material agregado', 'Cerrar', { duration: 2500 });
      },
      error: err => {
        this.guardando = false;
        const m = err?.error?.mensaje || 'No se pudo guardar';
        this.snack.open(m, 'Cerrar', { duration: 5000 });
      }
    });
  }

  actualizarPrecio(p: Producto, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const precio = parseFloat(input.value);
    if (!Number.isFinite(precio) || precio < 0) {
      this.snack.open('Precio inválido', 'Cerrar', { duration: 3000 });
      input.value = String(p.precio);
      return;
    }
    this.productoService.actualizar(p.id, { precio }).subscribe({
      next: act => {
        p.precio = act.precio;
        this.snack.open('Precio actualizado', 'Cerrar', { duration: 2000 });
      },
      error: err => {
        const m = err?.error?.mensaje || 'No se pudo actualizar';
        this.snack.open(m, 'Cerrar', { duration: 5000 });
        input.value = String(p.precio);
      }
    });
  }

  actualizarNombre(p: Producto, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const nombre = input.value.trim();
    if (!nombre) {
      this.snack.open('El nombre no puede quedar vacío', 'Cerrar', { duration: 3000 });
      input.value = p.nombre;
      return;
    }
    this.productoService.actualizar(p.id, { nombre, precio: p.precio }).subscribe({
      next: act => {
        p.nombre = act.nombre;
        this.snack.open('Nombre actualizado', 'Cerrar', { duration: 2000 });
      },
      error: err => {
        const m = err?.error?.mensaje || 'No se pudo actualizar';
        this.snack.open(m, 'Cerrar', { duration: 5000 });
        input.value = p.nombre;
      }
    });
  }

  eliminar(p: Producto): void {
    void Swal.fire({
      title: `¿Eliminar "${p.nombre}"?`,
      text: 'Solo si no está usado en movimientos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(r => {
      if (!r.isConfirmed) {
        return;
      }
      this.productoService.eliminar(p.id).subscribe({
        next: () => {
          this.materiales = this.materiales.filter(x => x.id !== p.id);
          this.snack.open('Material eliminado', 'Cerrar', { duration: 2500 });
        },
        error: err => {
          const m = err?.error?.mensaje || 'No se pudo eliminar';
          this.snack.open(m, 'Cerrar', { duration: 5000 });
        }
      });
    });
  }
}
