import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogsListComponent } from './logs-list/logs-list.component';
import { HangmanComponent } from './ahorcado/ahorcado.component';
import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
import { DuelComponent } from './duel/duel.component';
import { AuthGuard } from './guards/auth.guard';
import { ChatComponent } from './chat/chat.component';
import { QuienSoyComponent } from './quien-soy/quien-soy.component';
import { ResultsListComponent } from './results-list/results-list.component';
import { EncuestaComponent } from './components/encuesta/encuesta.component';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { PreguntadosDbzComponent } from './preguntados-dbz/preguntados-dbz';
import { FlowFreeComponent } from './flowfree/flowfree';
import { HomeComponent } from './homeX/home/home';

export const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'encuesta', component: EncuestaComponent},
  { path: 'quien-soy', component: QuienSoyComponent},
  { path: 'logs', component: LogsListComponent, canActivate:  [AuthGuard] },
  {
    path: 'games',
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'ahorcado', pathMatch: 'full' },
      { path: 'ahorcado', component: HangmanComponent },
      { path: 'mayor-menor', component: MayorMenorComponent },
      { path: 'preguntados', component: DuelComponent },
      { path: 'flowfree', component: FlowFreeComponent },
      { path: 'resultados', component: ResultsListComponent },
      { path: 'preguntados-dbz', component: PreguntadosDbzComponent}

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


