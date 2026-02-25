import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DuelComponent } from '../../duel/duel.component';
import { FlowFreeComponent } from '../../flowfree/flowfree';
import { MayorMenorComponent } from '../../mayor-menor/mayor-menor.component';
import { ResultsListComponent } from '../../results-list/results-list.component';
import { PreguntadosDbzComponent } from '../../preguntados-dbz_II/preguntados-dbz';
import { AhorcadoComponent } from '../../ahorcado_pista/ahorcado';
import { GenGameComponent } from '../../gen-game/gen-game.component';
import { MathGameComponent } from '../../math-game/math-game.component';

const routes: Routes = [
  { path: '', redirectTo: 'ahorcado', pathMatch: 'full' },
  { path: 'ahorcado', component: AhorcadoComponent },
  { path: 'mayor-menor', component: MayorMenorComponent },
  { path: 'preguntados', component: DuelComponent },
  { path: 'flowfree', component: FlowFreeComponent },
  { path: 'resultados', component: ResultsListComponent },
  { path: 'preguntados-dbz', component: PreguntadosDbzComponent },
  { path: 'gen-game', component: GenGameComponent },
  { path: 'math-game', component: MathGameComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GamesRoutingModule {}


// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @NgModule({
//   declarations: [],
//   imports: [
//     CommonModule
//   ]
// })
// export class GamesRoutingModule { }