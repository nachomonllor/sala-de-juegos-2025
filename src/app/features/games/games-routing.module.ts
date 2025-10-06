import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AhorcadoComponent } from '../../ahorcado/ahorcado.component';
import { DuelComponent } from '../../duel/duel.component';
import { FlowFreeComponent } from '../../flowfree/flowfree';
import { MayorMenorComponent } from '../../mayor-menor/mayor-menor.component';
import { PreguntadosDbzComponent } from '../../preguntados-dbz/preguntados-dbz';
import { ResultsListComponent } from '../../results-list/results-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'ahorcado', pathMatch: 'full' },
  { path: 'ahorcado', component: AhorcadoComponent },
  { path: 'mayor-menor', component: MayorMenorComponent },
  { path: 'preguntados', component: DuelComponent },
  { path: 'flowfree', component: FlowFreeComponent },
  { path: 'resultados', component: ResultsListComponent },
  { path: 'preguntados-dbz', component: PreguntadosDbzComponent }
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