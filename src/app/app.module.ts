import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { BrowserModule } from '@angular/platform-browser';

registerLocaleData(localeEs);
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ClientesComponent } from './clientes/clientes.component';
import { InicioComponent } from './inicio/inicio.component';
import { RouterModule, Routes } from '@angular/router';
import { RetirosComponent } from './retiros/retiros.component';
import { IndicadoresComponent } from './indicadores/indicadores.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { FormComponent } from './clientes/form.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { DetalleComponent } from './clientes/detalle/detalle.component';
import { DetalleVentaComponent } from './ventas/detalle-venta.component';
import { VentasComponent } from './ventas/ventas.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthGuard } from './core/auth.guard';
import { AuthInterceptor } from './core/auth.interceptor';
import { ReciclajeComponent } from './reciclaje/reciclaje.component';
import { MaterialesComponent } from './productos/materiales.component';
import { MovimientosListaComponent } from './ventas/movimientos-lista.component';
import { AdminGuard } from './core/admin.guard';
import { AdminUsuariosComponent } from './admin/admin-usuarios.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'inicio', component: InicioComponent, canActivate: [AuthGuard] },
  { path: 'clientes/form', component: FormComponent, canActivate: [AuthGuard] },
  { path: 'clientes/form/:id', component: FormComponent, canActivate: [AuthGuard] },
  { path: 'clientes/page/:page', component: ClientesComponent, canActivate: [AuthGuard] },
  { path: 'clientes', component: ClientesComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'retiros', component: RetirosComponent, canActivate: [AuthGuard] },
  { path: 'compras-ventas/editar/:id', component: VentasComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'compras-ventas/nueva', component: VentasComponent, canActivate: [AuthGuard] },
  { path: 'compras-ventas', component: MovimientosListaComponent, canActivate: [AuthGuard] },
  { path: 'materiales', component: MaterialesComponent, canActivate: [AuthGuard] },
  { path: 'admin/usuarios', component: AdminUsuariosComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'reportes', component: IndicadoresComponent, canActivate: [AuthGuard] },
  { path: 'reciclaje', component: ReciclajeComponent, canActivate: [AuthGuard] },
  { path: 'ventas/:id', component: DetalleVentaComponent, canActivate: [AuthGuard] },
  { path: 'ventas/form/:clienteId', component: VentasComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ClientesComponent,
    InicioComponent,
    RetirosComponent,
    IndicadoresComponent,
    LoginComponent,
    SignupComponent,
    FormComponent,
    DetalleComponent,
    PaginatorComponent,
    DetalleVentaComponent,
    VentasComponent,
    ReciclajeComponent,
    MaterialesComponent,
    MovimientosListaComponent,
    AdminUsuariosComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule
  ],
  providers: [
    AuthGuard,
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
