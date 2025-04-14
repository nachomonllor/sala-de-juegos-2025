import { Routes } from '@angular/router';
import { HangmanComponent } from './ahorcado/ahorcado.component';
import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
import { DuelComponent } from './duel/duel.component';
import { QuienSoyComponent } from './quien-soy/quien-soy.component';
import { FlowFreeComponent } from './flow-free/flow-free.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
    { path: 'ahorcado', component: HangmanComponent },
    { path: 'preguntados', component: DuelComponent },
    { path: 'mayor-menor', component: MayorMenorComponent },
    { path: 'flow-free', component: FlowFreeComponent},
    { path: 'quien-soy', component: QuienSoyComponent},
    { path: '', component: HomeComponent },
    {path: 'login', component:LoginComponent},
    {path: 'register', component: RegisterComponent},
    { path: '**', redirectTo: '' }
];


