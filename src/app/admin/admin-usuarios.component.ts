import { Component, OnInit } from '@angular/core';
import { AdminUsuarioService, UsuarioAdmin } from './admin-usuario.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.css']
})
export class AdminUsuariosComponent implements OnInit {
  usuarios: UsuarioAdmin[] = [];
  cargando = false;

  nuevo = { username: '', password: '', rol: 'NORMAL' as 'NORMAL' | 'ADMIN' };

  constructor(
    private adminUsuarioService: AdminUsuarioService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.refrescar();
  }

  refrescar(): void {
    this.cargando = true;
    this.adminUsuarioService.listar().subscribe({
      next: list => {
        this.usuarios = list || [];
        this.cargando = false;
      },
      error: () => {
        this.usuarios = [];
        this.cargando = false;
        this.snack.open('No se pudieron cargar los usuarios', 'Cerrar', { duration: 4000 });
      }
    });
  }

  crear(): void {
    const u = this.nuevo.username?.trim();
    const p = this.nuevo.password;
    if (!u || !p) {
      this.snack.open('Usuario y contraseña son obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }
    this.adminUsuarioService
      .crear({ username: u, password: p, rol: this.nuevo.rol })
      .subscribe({
        next: () => {
          this.nuevo = { username: '', password: '', rol: 'NORMAL' };
          void Swal.fire('Listo', 'Usuario creado', 'success');
          this.refrescar();
        },
        error: err => {
          const m = err?.error?.mensaje || 'No se pudo crear';
          this.snack.open(m, 'Cerrar', { duration: 5000 });
        }
      });
  }

  toggleEnabled(u: UsuarioAdmin): void {
    this.adminUsuarioService.actualizar(u.id, { enabled: !u.enabled }).subscribe({
      next: () => this.refrescar(),
      error: err => this.snack.open(err?.error?.mensaje || 'Error', 'Cerrar', { duration: 4000 })
    });
  }

  cambiarRol(u: UsuarioAdmin, rol: string): void {
    this.adminUsuarioService.actualizar(u.id, { rol }).subscribe({
      next: () => this.refrescar(),
      error: err => this.snack.open(err?.error?.mensaje || 'Error', 'Cerrar', { duration: 4000 })
    });
  }
}
