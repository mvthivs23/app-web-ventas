import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  title = 'EcoRecicla Gestión';

  constructor(
    public loginService: LoginService,
    private router: Router
  ) {}

  salir(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  nombreUsuario(): string {
    const u = this.loginService.getUser();
    if (!u) {
      return '';
    }
    if (u.nombre) {
      return `${u.nombre} ${u.apellido || ''}`.trim();
    }
    return u.username || '';
  }
}
