import { Routes } from '@angular/router';
import { HomeComponent } from './homeX/home/home';
import { AuthGuard } from './guards/auth.guard';
import { ResultsListComponent } from './results-list/results-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/register', pathMatch: 'full' },

  // Home (puede quedar eager [[  ver definicion eager   ]])
  { path: 'home', component: HomeComponent },
  { path: 'resultados', component: ResultsListComponent },


  // Alias para no romper enlaces existentes
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },

  // Auth (lazy)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // Games (lazy + guard)
  {
    path: 'games',
    canActivate: [AuthGuard],        //  bloquear antes de cargar el chunk  [[[ ver nota "canMatch" en la docu ]]]
    loadChildren: () => import('./features/games/games.module').then(m => m.GamesModule)
  },

  // Chat (lazy + guard)
  {
    path: 'chat',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/chat/chat.module').then(m => m.ChatModule)
  },

  // Quien Soy (lazy)
  {
    path: 'quien-soy',
    loadChildren: () =>
      import('./features/quien-soy/quien-soy.module').then(m => m.QuienSoyModule)
  },

  // Logs (lazy + guard)
  {
    path: 'logs',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/logs-list/logs-list.module').then(m => m.LogsListModule)
  },

  // Encuesta (lazy)
  {
    path: 'encuesta',
    loadChildren: () =>
      import('./features/encuesta/encuesta.module').then(m => m.EncuestaModule)
  },

  { path: '**', redirectTo: 'home' }
];





// import { Routes } from '@angular/router';
// import { LogsListComponent } from './logs-list/logs-list.component';
// import { AhorcadoComponent } from './ahorcado/ahorcado.component';
// import { MayorMenorComponent } from './mayor-menor/mayor-menor.component';
// import { DuelComponent } from './duel/duel.component';
// import { AuthGuard } from './guards/auth.guard';
// import { ChatComponent } from './chat/chat.component';
// import { QuienSoyComponent } from './quien-soy/quien-soy.component';
// import { ResultsListComponent } from './results-list/results-list.component';
// import { EncuestaComponent } from './components/encuesta/encuesta.component';
// import { LoginComponent } from './login/login';
// import { RegisterComponent } from './register/register';
// import { PreguntadosDbzComponent } from './preguntados-dbz/preguntados-dbz';
// import { FlowFreeComponent } from './flowfree/flowfree';
// import { HomeComponent } from './homeX/home/home';

// export const routes: Routes = [
//   { path: '', redirectTo: 'register', pathMatch: 'full' },
//   { path: 'home', component: HomeComponent },
//   { path: 'login', component: LoginComponent },
//   { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
//   { path: 'register', component: RegisterComponent },
//   { path: 'encuesta', component: EncuestaComponent },
//   { path: 'quien-soy', component: QuienSoyComponent },
//   { path: 'logs', component: LogsListComponent, canActivate: [AuthGuard] },
//   {
//     path: 'games',
//     canActivate: [AuthGuard],
//     children: [
//       { path: '', redirectTo: 'ahorcado', pathMatch: 'full' },
//       { path: 'ahorcado', component: AhorcadoComponent },
//       { path: 'mayor-menor', component: MayorMenorComponent },
//       { path: 'preguntados', component: DuelComponent },
//       { path: 'flowfree', component: FlowFreeComponent },
//       { path: 'resultados', component: ResultsListComponent },
//       { path: 'preguntados-dbz', component: PreguntadosDbzComponent }
//     ]
//   },
//   { path: '**', redirectTo: 'home' }
// ];







