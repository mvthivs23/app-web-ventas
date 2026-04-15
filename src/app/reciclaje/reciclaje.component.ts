import { Component, OnInit } from '@angular/core';
import { VentaService } from '../ventas/services/venta.service';

/** kg CO2e evitados aproximados por kg de material reciclado (orden de magnitud, uso informativo). */
function factorCo2ePorMaterial(nombre: string): number {
  const n = (nombre || '').toLowerCase();
  if (n.includes('alumin')) {
    return 8.1;
  }
  if (n.includes('cobre')) {
    return 4.0;
  }
  if (n.includes('plást') || n.includes('plastic')) {
    return 1.4;
  }
  if (n.includes('pet')) {
    return 1.6;
  }
  if (n.includes('papel') || n.includes('cartón') || n.includes('carton')) {
    return 0.9;
  }
  if (n.includes('vidrio')) {
    return 0.35;
  }
  if (n.includes('chatarra') || n.includes('hierro') || n.includes('acero')) {
    return 0.55;
  }
  return 0.85;
}

@Component({
  selector: 'app-reciclaje',
  templateUrl: './reciclaje.component.html',
  styleUrls: ['./reciclaje.component.css']
})
export class ReciclajeComponent implements OnInit {
  cargando = false;
  filasMes: { material: string; cantidad: number; co2e: number }[] = [];
  totalCantidad = 0;
  totalCo2e = 0;
  mesEtiqueta = '';
  sinDatos = false;

  constructor(private ventaService: VentaService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    this.mesEtiqueta = ahora.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    this.cargando = true;
    this.ventaService.getMaterialRecicladoPorMes().subscribe({
      next: rows => {
        const list = rows || [];
        const filtradas = list.filter(
          (r: any) => Number(r.anio) === anio && Number(r.mes) === mes
        );
        this.filasMes = filtradas.map((r: any) => {
          const cantidad = Number(r.cantidad) || 0;
          const material = String(r.material || 'Material');
          const factor = factorCo2ePorMaterial(material);
          return { material, cantidad, co2e: cantidad * factor };
        });
        this.totalCantidad = this.filasMes.reduce((s, r) => s + r.cantidad, 0);
        this.totalCo2e = this.filasMes.reduce((s, r) => s + r.co2e, 0);
        this.sinDatos = this.filasMes.length === 0;
        this.cargando = false;
      },
      error: () => {
        this.filasMes = [];
        this.totalCantidad = 0;
        this.totalCo2e = 0;
        this.sinDatos = true;
        this.cargando = false;
      }
    });
  }

  /** Equivalente arbóreo muy simplificado (~21 kg CO2/año por árbol joven). */
  get equivalenteArboles(): number {
    if (this.totalCo2e <= 0) {
      return 0;
    }
    return this.totalCo2e / 21;
  }

  get energiaEstimadaKwh(): number {
    // Factor grid mix aproximado Chile ~0.35 kg CO2e / kWh
    if (this.totalCo2e <= 0) {
      return 0;
    }
    return this.totalCo2e / 0.35;
  }
}
