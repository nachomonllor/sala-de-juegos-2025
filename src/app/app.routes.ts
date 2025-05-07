import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LogsListComponent } from './logs-list/logs-list.component';

import { HangmanComponent } from './ahorcado/ahorcado.component';
import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
import { DuelComponent } from './duel/duel.component';
import { FlowfreeComponent } from './flow-free/flow-free.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'logs', component: LogsListComponent, canActivate:  [AuthGuard] },
  {
    path: 'games',
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'ahorcado', pathMatch: 'full' },
      { path: 'ahorcado', component: HangmanComponent },
      { path: 'mayor-menor', component: MayorMenorComponent },
      { path: 'preguntados', component: DuelComponent },
      { path: 'flowfree', component: FlowfreeComponent }
    ]
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}





// import { Routes } from '@angular/router';
// import { HangmanComponent } from './ahorcado/ahorcado.component';
// import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
// import { DuelComponent } from './duel/duel.component';
// import { QuienSoyComponent } from './quien-soy/quien-soy.component';
// import { HomeComponent } from './home/home.component';
// import { LoginComponent } from './login/login.component';
// import { RegisterComponent } from './register/register.component';
// import { FlowfreeComponent } from './flow-free/flow-free.component';
// import { UserListComponent } from './user-list/user-list.component';

// export const routes: Routes = [


//     { path: 'login', component:LoginComponent},
//     { path: 'home', component: HomeComponent}, 
//     { path: 'ahorcado', component: HangmanComponent },
//     { path: 'preguntados', component: DuelComponent },
//     { path: 'mayor-menor', component: MayorMenorComponent },
//     { path: 'flowfree', component: FlowfreeComponent},
//     { path: 'quien-soy', component: QuienSoyComponent},
//     { path: 'register', component: RegisterComponent},
//     { path: 'user-list', component: UserListComponent},
//     { path: '', component: LoginComponent },
//     { path: '**', redirectTo: '' }

    
// ];


