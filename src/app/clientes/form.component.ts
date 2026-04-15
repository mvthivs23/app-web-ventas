import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  public cliente: Cliente = new Cliente();
  public titulo = 'Nuevo cliente';

  constructor(
    private clienteService: ClienteService,
    private snack: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const raw = params.get('id');
      if (raw != null && raw !== '') {
        const id = Number(raw);
        if (!Number.isFinite(id) || id <= 0) {
          this.titulo = 'Nuevo cliente';
          this.cliente = new Cliente();
          return;
        }
        this.titulo = 'Editar cliente';
        this.clienteService.getCliente(id).subscribe(c => (this.cliente = c));
      } else {
        this.titulo = 'Nuevo cliente';
        this.cliente = new Cliente();
      }
    });
  }

  /** Solo campos persistidos por el API (no ventas, comuna ni foto desde el formulario). */
  private payloadContacto(): Pick<Cliente, 'nombre' | 'ubicacion' | 'email' | 'telefono'> {
    return {
      nombre: (this.cliente.nombre ?? '').trim(),
      ubicacion: (this.cliente.ubicacion ?? '').trim(),
      email: (this.cliente.email ?? '').trim(),
      telefono: (this.cliente.telefono ?? '').trim()
    };
  }

  create(): void {
    if (!this.cliente.nombre?.trim()) {
      this.snack.open('Complete los datos del formulario', 'Cerrar', { duration: 3000 });
      return;
    }
    this.clienteService.create(this.payloadContacto() as Cliente).subscribe({
      next: json => {
        this.router.navigate(['/clientes']);
        Swal.fire('Cliente creado', `Se registró a ${json.cliente.nombre}`, 'success');
      },
      error: err => {
        const msg = err.error?.errors?.join('\n') || err.error?.mensaje || 'No se pudo crear el cliente';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  update(): void {
    const body = { ...this.payloadContacto(), id: this.cliente.id } as Cliente;
    this.clienteService.update(body).subscribe({
      next: () => {
        this.router.navigate(['/clientes']);
        Swal.fire('Actualizado', 'Los datos del cliente se guardaron correctamente.', 'success');
      },
      error: err => {
        const msg = err.error?.errors?.join('\n') || err.error?.mensaje || 'No se pudo actualizar';
        Swal.fire('Error', msg, 'error');
      }
    });
  }
}
