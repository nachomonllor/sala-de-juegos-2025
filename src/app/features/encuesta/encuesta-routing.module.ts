
// encuesta-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EncuestaComponent } from '../../encuesta/encuesta.component';
import { EncuestaRespuestasComponent } from '../../encuesta-respuestas/encuesta-respuestas.component';
import { AdminGuard } from '../../guards/admin.guard';

const routes: Routes = [
  { path: '', component: EncuestaComponent },
  {
    path: 'respuestas',
    component: EncuestaRespuestasComponent,
    canActivate: [AdminGuard],
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class EncuestaRoutingModule {}