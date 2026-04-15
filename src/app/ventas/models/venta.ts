import { ItemVenta } from "./item-venta";
import { Cliente } from "src/app/clientes/cliente";
export class Venta {

    id: number;
    descripcion: string;
    observacion: string;
    tipo: string = 'INGRESO';
    /** Retiro de excedente (venta en volumen a distribuidor). */
    retiroExcedente = false;
    items: Array<ItemVenta>=[];
    cliente: Cliente;
    total: number;
    createAt: string;

    calcularGranTotal(): number{
        this.total = 0;
        this.items.forEach((item: ItemVenta) => {
            this.total += item.calcularImporte();
        });
        return this.total;
    }
}
