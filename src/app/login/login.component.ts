import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginData = { username: '', password: '' };
  cargando = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(q => {
      if (q['sesion'] === 'expirada') {
        this.snack.open('Su sesión expiró o ya no es válida. Inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  iniciarSesion(): void {
    if (!this.loginData.username?.trim() || !this.loginData.password) {
      this.snack.open('Ingrese usuario y contraseña', 'Cerrar', { duration: 3000 });
      return;
    }
    this.cargando = true;
    this.loginService.generateToken(this.loginData).subscribe({
      next: (data: any) => {
        this.loginService.loginUser(data.token);
        this.loginService.getCurrentUser().subscribe({
          next: (user: any) => {
            this.loginService.setUser(user);
            this.cargando = false;
            void this.router.navigate(['/inicio']);
          },
          error: () => {
            this.loginService.setUser({
              username: this.loginData.username.trim(),
              nombre: this.loginData.username.trim()
            });
            this.cargando = false;
            void this.router.navigate(['/inicio']);
          }
        });
      },
      error: (err: {
        error?: { mensaje?: string; message?: string } | string;
        message?: string;
        status?: number;
      }) => {
        this.cargando = false;
        const body = err?.error;
        const fromJson =
          typeof body === 'object' && body !== null
            ? body.mensaje || body.message
            : typeof body === 'string'
              ? body
              : null;
        const msg =
          fromJson ||
          err?.message ||
          (err?.status === 0 ? 'Sin conexión con el servidor. Revise Docker o la URL del API.' : null) ||
          'No se pudo iniciar sesión. Revise usuario y contraseña.';
        this.snack.open(msg, 'Cerrar', { duration: 6000 });
      }
    });
  }
}
