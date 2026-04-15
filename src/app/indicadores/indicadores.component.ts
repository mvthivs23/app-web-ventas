import { Component, OnInit } from '@angular/core';
import { VentaService } from '../ventas/services/venta.service';

@Component({
  selector: 'app-indicadores',
  templateUrl: './indicadores.component.html',
  styleUrls: ['./indicadores.component.css']
})
export class IndicadoresComponent implements OnInit {
  desde = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10);
  hasta = new Date().toISOString().substring(0, 10);
  reporte: any = null;
  ventasDetalle: any[] = [];
  materialPorMes: any[] = [];
  metricas: any = null;
  cargando = false;
  cargandoMaterial = false;
  cargandoMetricas = false;

  mesNombre(m: number): string {
    const n = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return n[(m || 1) - 1] || String(m);
  }

  get totalMaterial(): number {
    return (this.materialPorMes || []).reduce((s, r) => s + (Number(r.cantidad) || 0), 0);
  }

  private ordenarVentas(list: any[] | undefined): any[] {
    if (!list?.length) {
      return [];
    }
    return [...list].sort((a, b) => {
      const da = a?.createAt ? new Date(a.createAt).getTime() : 0;
      const db = b?.createAt ? new Date(b.createAt).getTime() : 0;
      return db - da;
    });
  }

  esEgreso(v: any): boolean {
    return String(v?.tipo || '').toUpperCase() === 'EGRESO';
  }

  /** Interpreta `yyyy-MM-dd` como fecha local (evita desfase del pipe con UTC). */
  fechaDesdeYmd(s: string | null | undefined): Date | null {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return null;
    }
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  constructor(private ventaService: VentaService) {}

  ngOnInit(): void {
    this.buscarReporte();
    this.cargarMaterial();
  }

  buscarReporte(): void {
    this.cargando = true;
    this.cargarMetricas();
    this.ventaService.getReporteVentas(this.desde, this.hasta).subscribe({
      next: response => {
        this.reporte = response;
        this.ventasDetalle = this.ordenarVentas(response?.ventas);
        this.cargando = false;
      },
      error: () => {
        this.reporte = null;
        this.ventasDetalle = [];
        this.cargando = false;
      }
    });
  }

  cargarMetricas(): void {
    this.cargandoMetricas = true;
    this.ventaService.getMetricas(this.desde, this.hasta).subscribe({
      next: m => {
        this.metricas = m;
        this.cargandoMetricas = false;
      },
      error: () => {
        this.metricas = null;
        this.cargandoMetricas = false;
      }
    });
  }

  /** CSV con separador ; para abrir bien en Excel regional es-CL */
  tipoReportePdf: 'TODOS' | 'INGRESO' | 'EGRESO' = 'TODOS';

  descargarPdfReporte(): void {
    const tipo = this.tipoReportePdf === 'TODOS' ? undefined : this.tipoReportePdf;
    this.ventaService.descargarReportePdf(this.desde, this.hasta, tipo).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_movimientos_${this.desde}_${this.hasta}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        /* snack opcional */
      }
    });
  }

  descargarCsvMovimientos(): void {
    const rows = this.ventasDetalle;
    if (!rows?.length) {
      return;
    }
    const esc = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = ['Fecha', 'Tipo', 'Cliente', 'Descripcion', 'Total', 'Observacion', 'Retiro'].map(esc).join(';');
    const lines = [header];
    for (const v of rows) {
      const fecha = v?.createAt ? new Date(v.createAt).toISOString().substring(0, 10) : '';
      const tipo = this.esEgreso(v) ? 'EGRESO' : 'INGRESO';
      const cli = v?.cliente?.nombre ?? '';
      const ret = v?.retiroExcedente ? 'Sí' : 'No';
      lines.push([fecha, tipo, cli, v?.descripcion ?? '', v?.total ?? '', v?.observacion ?? '', ret].map(esc).join(';'));
    }
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `movimientos_${this.desde}_${this.hasta}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  cargarMaterial(): void {
    this.cargandoMaterial = true;
    this.ventaService.getMaterialRecicladoPorMes().subscribe({
      next: rows => {
        const list = rows || [];
        this.materialPorMes = [...list].sort((a, b) => {
          const ya = Number(a.anio) || 0;
          const yb = Number(b.anio) || 0;
          if (ya !== yb) {
            return yb - ya;
          }
          const ma = Number(a.mes) || 0;
          const mb = Number(b.mes) || 0;
          if (ma !== mb) {
            return mb - ma;
          }
          return String(a.material || '').localeCompare(String(b.material || ''), 'es');
        });
        this.cargandoMaterial = false;
      },
      error: () => {
        this.materialPorMes = [];
        this.cargandoMaterial = false;
      }
    });
  }
}
