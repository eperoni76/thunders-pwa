import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './component/homepage/homepage.component';
import { GiocatoriComponent } from "./component/giocatori/giocatori.component";
import { CalendarioComponent } from './component/calendario/calendario.component';
import { ClassificaComponent } from './component/classifica/classifica.component';
import { LoginComponent } from './component/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomepageComponent, canActivate: [AuthGuard] },
  { path: 'squadra', component: GiocatoriComponent, canActivate: [AuthGuard] },
  { path: 'calendario', component: CalendarioComponent, canActivate: [AuthGuard] },
  { path: 'classifica', component: ClassificaComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
