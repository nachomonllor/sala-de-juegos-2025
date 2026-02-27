import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesRoutingModule } from './games-routing.module';
import { DuelComponent } from '../../duel/duel.component';
import { FlowFreeComponent } from '../../flowfree/flowfree';
import { MayorMenorComponent } from '../../mayor-menor/mayor-menor.component';
import { ResultsListComponent } from '../../results-list/results-list.component';
import { PreguntadosDbzComponent } from '../../preguntados-dbz_II/preguntados-dbz';
import { AhorcadoComponent } from '../../ahorcado_pista/ahorcado';
import { GenGameComponent } from '../../gen-game/gen-game.component';
import { MathGameComponent } from '../../math-game/math-game.component';
import { WaterSortComponent } from '../../water-sort/water-sort.component';
import { PacmanComponent } from '../../pacman/pacman.component';
import { SnakeComponent } from '../../snake/snake.component';
import { HanoiComponent } from '../../hanoi/hanoi.component';
import { NatureParkComponent } from '../../nature-park/nature-park.component';

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

    PreguntadosDbzComponent,
    GenGameComponent,
    MathGameComponent ,
    WaterSortComponent,
    PacmanComponent,
    SnakeComponent,
    HanoiComponent,
    NatureParkComponent
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
