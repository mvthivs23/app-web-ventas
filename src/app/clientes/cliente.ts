import { Venta } from "../ventas/models/venta";
import { Comuna } from "../ventas/models/comuna";


export class Cliente {
    id: number;
    nombre: string;
    ubicacion: string;
    email: string;
    telefono: string;
    comuna: Comuna;
    foto: string;
    ventas: Array<Venta> = [];
    eliminado?: boolean;
    }

