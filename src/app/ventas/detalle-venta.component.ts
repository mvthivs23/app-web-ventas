import { Component, OnInit } from '@angular/core';
import { Venta } from './models/venta';
import { ActivatedRoute } from '@angular/router';
import { VentaService } from './services/venta.service';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-detalle-venta',
  templateUrl: './detalle-venta.component.html'
})
export class DetalleVentaComponent implements OnInit {
  venta: Venta;
  titulo = 'Detalle del movimiento';

  constructor(
    private ventaService: VentaService,
    private activatedRoute: ActivatedRoute,
    public loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = +params.get('id');
      this.ventaService.getVenta(id).subscribe(venta => (this.venta = venta));
    });
  }

  esEgreso(): boolean {
    return String(this.venta?.tipo || '').toUpperCase() === 'EGRESO';
  }
}
