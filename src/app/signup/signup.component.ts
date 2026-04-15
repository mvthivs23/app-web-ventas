import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../user/usuario.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  readonly rolOpciones = [
    { valor: 'NORMAL' as const, etiqueta: 'Operador', descripcion: 'Gestión diaria de ventas y clientes' },
    { valor: 'ADMIN' as const, etiqueta: 'Administrador', descripcion: 'Acceso completo al sistema' }
  ];

  modelo = {
    username: '',
    password: '',
    rol: 'NORMAL' as 'NORMAL' | 'ADMIN'
  };

  enviando = false;

  constructor(
    private usuarioService: UsuarioService,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  formSubmit(): void {
    const u = this.modelo.username?.trim() || '';
    const p = this.modelo.password || '';
    if (u.length < 3) {
      this.snack.open('El usuario debe tener al menos 3 caracteres.', 'Cerrar', { duration: 3500 });
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(u)) {
      this.snack.open('Solo letras, números, punto, guion y guion bajo.', 'Cerrar', { duration: 4000 });
      return;
    }
    if (p.length < 6) {
      this.snack.open('La contraseña debe tener al menos 6 caracteres.', 'Cerrar', { duration: 3500 });
      return;
    }

    this.enviando = true;
    this.usuarioService
      .registrar({
        username: u,
        password: p,
        rol: this.modelo.rol
      })
      .subscribe({
        next: () => {
          this.enviando = false;
          void Swal.fire({
            icon: 'success',
            title: 'Listo',
            text: 'Su cuenta fue creada. Ya puede iniciar sesión.',
            confirmButtonText: 'Ir al inicio de sesión'
          }).then(() => this.router.navigate(['/login']));
        },
        error: err => {
          this.enviando = false;
          const body = err?.error;
          let msg = 'No se pudo completar el registro.';
          if (typeof body === 'string' && body.trim().startsWith('<')) {
            msg = 'El servidor respondió con error (p. ej. 502). Revise que el backend esté en marcha.';
          } else if (typeof body === 'string') {
            msg = body;
          } else if (body?.mensaje) {
            msg = body.mensaje;
          } else if (body?.message) {
            msg = body.message;
          } else if (Array.isArray(body?.errors)) {
            msg = body.errors.join(' ');
          } else if (err.status === 0) {
            msg = 'Sin conexión con el servidor.';
          }
          this.snack.open(msg, 'Cerrar', {
            duration: 5500,
            verticalPosition: 'top',
            horizontalPosition: 'end'
          });
        }
      });
  }
}
