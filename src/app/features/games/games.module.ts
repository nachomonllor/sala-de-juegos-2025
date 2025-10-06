import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesRoutingModule } from './games-routing.module';
import { AhorcadoComponent } from '../../ahorcado/ahorcado.component';
import { DuelComponent } from '../../duel/duel.component';
import { FlowFreeComponent } from '../../flowfree/flowfree';
import { MayorMenorComponent } from '../../mayor-menor/mayor-menor.component';
import { PreguntadosDbzComponent } from '../../preguntados-dbz/preguntados-dbz';
import { ResultsListComponent } from '../../results-list/results-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    GamesRoutingModule,
    AhorcadoComponent,
    MayorMenorComponent,
    DuelComponent,
    FlowFreeComponent,
    ResultsListComponent,
    PreguntadosDbzComponent
  ]
})
export class GamesModule {}


// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// @NgModule({
//   declarations: [],
//   imports: [
//     CommonModule
//   ]
// })
// export class GamesModule { }
