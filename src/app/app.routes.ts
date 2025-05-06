import { Routes } from '@angular/router';
import { HangmanComponent } from './ahorcado/ahorcado.component';
import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
import { DuelComponent } from './duel/duel.component';
import { QuienSoyComponent } from './quien-soy/quien-soy.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FlowfreeComponent } from './flow-free/flow-free.component';
import { UserListComponent } from './user-list/user-list.component';

export const routes: Routes = [

    { path: 'home', component: HomeComponent}, 
    { path: 'ahorcado', component: HangmanComponent },
    { path: 'preguntados', component: DuelComponent },
    { path: 'mayor-menor', component: MayorMenorComponent },
    { path: 'flowfree', component: FlowfreeComponent},
    { path: 'quien-soy', component: QuienSoyComponent},
    { path: 'login', component:LoginComponent},
    { path: 'register', component: RegisterComponent},
    { path: 'user-list', component: UserListComponent},
    { path: '', component: HomeComponent },
    { path: '**', redirectTo: '' }
];


