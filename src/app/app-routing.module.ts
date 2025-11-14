import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './component/homepage/homepage.component';
import { GiocatoriComponent } from "./component/giocatori/giocatori.component";
import { CalendarioComponent } from './component/calendario/calendario.component';
import { TesseratiComponent } from './component/tesserati/tesserati.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomepageComponent },
  { path: 'squadra', component: GiocatoriComponent },
  { path: 'calendario', component: CalendarioComponent },
  { path: 'tesserati', component: TesseratiComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
