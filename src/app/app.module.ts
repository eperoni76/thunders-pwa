import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HomepageComponent } from './component/homepage/homepage.component';
import { GiocatoriComponent } from './component/giocatori/giocatori.component';
import { DialogGiocatoreComponent } from './component/dialog-giocatore/dialog-giocatore.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { HeaderComponent } from './component/header/header.component';
import { CalendarioComponent } from './component/calendario/calendario.component';
import { DialogCalendarioComponent } from './component/dialog-calendario/dialog-calendario.component';
import { DialogRisultatoComponent } from './component/dialog-risultato/dialog-risultato.component';

// Firebase imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    GiocatoriComponent,
    DialogGiocatoreComponent,
    HeaderComponent,
    CalendarioComponent,
    DialogCalendarioComponent,
    DialogRisultatoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ReactiveFormsModule,
    FormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
