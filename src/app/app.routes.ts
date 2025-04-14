import { Routes } from '@angular/router';
import { HangmanComponent } from './ahorcado/ahorcado.component';
import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
import { PantallaJuegosComponent } from './pantalla-juegos/pantalla-juegos.component';
import { DuelComponent } from './duel/duel.component';
import { QuienSoyComponent } from './quien-soy/quien-soy.component';
import { FlowFreeComponent } from './flow-free/flow-free.component';

export const routes: Routes = [
    { path: 'ahorcado', component: HangmanComponent },
    { path: 'preguntados', component: DuelComponent },
    { path: 'mayor-menor', component: MayorMenorComponent },
    { path: 'flow-free', component: FlowFreeComponent},
    { path: 'quien-soy', component: QuienSoyComponent},
    { path: 'juegos', component: PantallaJuegosComponent},
    { path: '', component: PantallaJuegosComponent },
    { path: '**', redirectTo: '' }
];


