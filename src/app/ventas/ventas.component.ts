import { Component, OnInit } from '@angular/core';
import { Venta } from './models/venta';
import { Cliente } from '../clientes/cliente';
import { ClienteService } from '../clientes/cliente.service';
import { FormControl } from '@angular/forms';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, mergeMap, switchMap } from 'rxjs/operators';
import { VentaService } from './services/venta.service';
import { Producto } from './models/producto';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ItemVenta } from './models/item-venta';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  titulo = 'Compra / venta de material';
  venta: Venta = new Venta();
  autoCompleteControl = new FormControl();
  clienteBusqueda = new FormControl('');
  productosFiltrados: Observable<Producto[]>;
  clientesFiltrados: Observable<Cliente[]>;
  /** Ruta sin /ventas/form/:id → elige cliente aquí */
  modoClienteLibre = false;
  /** Query `?retiro=1` desde Retiros → ingreso marcado como retiro */
  modoRetiro = false;
  /** Ruta `/compras-ventas/editar/:id` (solo administrador) */
  modoEdicion = false;
  editarId: number | null = null;

  constructor(
    private clienteService: ClienteService,
    private ventaService: VentaService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    combineLatest([this.activatedRoute.paramMap, this.activatedRoute.queryParamMap]).subscribe(([params, q]) => {
      const url = this.router.url.split('?')[0];
      if (url.includes('/compras-ventas/editar/')) {
        const id = +params.get('id');
        if (Number.isFinite(id) && id > 0) {
          this.modoEdicion = true;
          this.editarId = id;
          this.cargarVentaEdicion(id);
        }
        return;
      }
      this.modoEdicion = false;
      this.editarId = null;

      const raw = params.get('clienteId');
      this.modoRetiro = q.get('retiro') === '1';
      if (this.modoRetiro) {
        this.venta.retiroExcedente = true;
        this.venta.tipo = 'INGRESO';
        this.titulo = 'Retiro de excedente';
      } else {
        this.titulo = 'Compra / venta de material';
      }

      if (raw != null && raw !== '') {
        const clienteId = +raw;
        this.modoClienteLibre = false;
        if (Number.isFinite(clienteId) && clienteId > 0) {
          this.clienteService.getCliente(clienteId).subscribe({
            next: cliente => (this.venta.cliente = cliente),
            error: () => {
              this.snack.open('No se pudo cargar el cliente', 'Cerrar', { duration: 4000 });
              void this.router.navigate(['/compras-ventas/nueva']);
            }
          });
        }
      } else {
        this.modoClienteLibre = true;
        this.venta.cliente = undefined as unknown as Cliente;
      }
    });

    this.productosFiltrados = this.autoCompleteControl.valueChanges.pipe(
      map(value => (typeof value === 'string' ? value : value?.nombre)),
      mergeMap(value => (value ? this._filterProductos(value) : of([])))
    );

    this.clientesFiltrados = this.clienteBusqueda.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(txt => {
        if (typeof txt !== 'string') {
          return of([]);
        }
        const q = txt.trim();
        if (q.length < 2) {
          return of([]);
        }
        return this.clienteService.buscar(q);
      })
    );
  }

  private cargarVentaEdicion(id: number): void {
    this.ventaService.getVenta(id).subscribe({
      next: v => {
        this.venta = v;
        this.modoClienteLibre = false;
        this.modoRetiro = false;
        this.titulo = `Editar movimiento #${v.id}`;
        if (v.cliente) {
          this.clienteBusqueda.setValue(v.cliente.nombre, { emitEvent: false });
        }
      },
      error: () => {
        this.snack.open('No se pudo cargar el movimiento', 'Cerrar', { duration: 5000 });
        void this.router.navigate(['/compras-ventas']);
      }
    });
  }

  private _filterProductos(value: string): Observable<Producto[]> {
    return this.ventaService.filtrarProductos(value.toLowerCase());
  }

  mostrarNombre(producto?: Producto): string | undefined {
    return producto ? producto.nombre : undefined;
  }

  mostrarCliente(c?: Cliente | string | null): string {
    if (c == null) {
      return '';
    }
    if (typeof c === 'string') {
      return c;
    }
    return c.nombre || '';
  }

  seleccionarCliente(ev: MatAutocompleteSelectedEvent): void {
    this.venta.cliente = ev.option.value as Cliente;
    this.clienteBusqueda.setValue(this.venta.cliente.nombre, { emitEvent: false });
  }

  onTipoChange(): void {
    if (this.venta.tipo === 'EGRESO') {
      this.venta.retiroExcedente = false;
    }
  }

  seleccionarProducto(event: MatAutocompleteSelectedEvent): void {
    const producto = event.option.value as Producto;
    if (this.existeItem(producto.id)) {
      this.incrementaCantidad(producto.id);
    } else {
      const nuevoItem = new ItemVenta();
      nuevoItem.producto = producto;
      nuevoItem.cantidad = 1;
      this.venta.items.push(nuevoItem);
    }
    this.autoCompleteControl.setValue('');
    event.option.focus();
    event.option.deselect();
  }

  actualizarCantidad(id: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const cantidad = parseFloat(input.value);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return this.eliminarItemVenta(id);
    }
    this.venta.items = this.venta.items.map((item: ItemVenta) => {
      if (id === item.producto.id) {
        item.cantidad = cantidad;
      }
      return item;
    });
  }

  existeItem(id: number): boolean {
    return this.venta.items.some((item: ItemVenta) => id === item.producto.id);
  }

  incrementaCantidad(id: number): void {
    this.venta.items = this.venta.items.map((item: ItemVenta) => {
      if (id === item.producto.id) {
        item.cantidad = (Number(item.cantidad) || 0) + 1;
      }
      return item;
    });
  }

  eliminarItemVenta(id: number): void {
    this.venta.items = this.venta.items.filter((item: ItemVenta) => id !== item.producto.id);
  }

  create(): void {
    if (!this.venta.cliente?.id) {
      this.snack.open('Seleccione o cargue un cliente', 'Cerrar', { duration: 4000 });
      return;
    }
    this.venta.tipo = this.venta.tipo || 'INGRESO';
    if (this.modoEdicion && this.editarId != null) {
      this.ventaService.update(this.editarId, this.venta).subscribe({
        next: v => {
          void Swal.fire('Actualizado', `Movimiento #${v.id} guardado.`, 'success');
          void this.router.navigate(['/compras-ventas']);
        },
        error: err => {
          const m = err?.error?.mensaje || 'No se pudo actualizar el movimiento';
          this.snack.open(m, 'Cerrar', { duration: 5500 });
        }
      });
      return;
    }
    this.ventaService.create(this.venta).subscribe({
      next: v => {
        void Swal.fire(this.titulo, `Registro #${v.id} guardado: ${v.descripcion || ''}`, 'success');
        this.reiniciarFormularioTrasGuardar();
      },
      error: err => {
        const m = err?.error?.mensaje || 'No se pudo guardar el movimiento';
        this.snack.open(m, 'Cerrar', { duration: 5500 });
      }
    });
  }

  private reiniciarFormularioTrasGuardar(): void {
    if (this.modoEdicion) {
      return;
    }
    const tipo = this.venta.tipo;
    const cli = this.venta.cliente;
    const libre = this.modoClienteLibre;
    const ret = this.modoRetiro;
    this.venta = new Venta();
    if (ret) {
      this.venta.tipo = 'INGRESO';
      this.venta.retiroExcedente = true;
    } else {
      this.venta.tipo = tipo;
      this.venta.retiroExcedente = false;
    }
    if (!libre && cli?.id) {
      this.venta.cliente = cli;
    } else {
      this.venta.cliente = undefined as unknown as Cliente;
      this.clienteBusqueda.setValue('', { emitEvent: false });
    }
    this.autoCompleteControl.setValue('');
  }
}

