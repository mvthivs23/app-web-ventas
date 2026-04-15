import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { ModalService } from './detalle/modal.service';
import Swal from 'sweetalert2';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { apiUrl } from '../core/api-url';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {

  clientes: Cliente[];
  paginador: any;
  clienteSeleccionado: Cliente;

  constructor(
    private clienteService: ClienteService,
    private activatedRoute: ActivatedRoute,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      let page = +params.get('page');
      if (Number.isNaN(page)) {
        page = 0;
      }
      this.clienteService.getClientes(page).pipe(
        tap(response => {
          (response.content as Cliente[]).forEach(c => console.log(c.nombre));
        })
      ).subscribe(response => {
        this.clientes = response.content as Cliente[];
        this.paginador = response;
      });
    });
  }

  fotoCliente(cliente: Cliente): string {
    if (cliente?.foto) {
      return apiUrl('/api/uploads/img/' + cliente.foto);
    }
    return 'assets/img/cliente-placeholder.svg';
  }

  delete(cliente: Cliente): void {
    Swal.fire({
      title: `¿Eliminar a ${cliente.nombre}?`,
      text: 'El cliente quedará marcado como eliminado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.clienteService.delete(cliente.id).subscribe(() => {
          this.clientes = this.clientes.filter(cli => cli !== cliente);
          Swal.fire('Listo', `Se eliminó el registro de ${cliente.nombre}.`, 'success');
        });
      }
    });
  }

  abrirModal(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.modalService.abrirModal();
  }
}
