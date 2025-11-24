// encuesta.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncuestaComponent } from '../../encuesta/encuesta.component';
import { EncuestaRoutingModule } from './encuesta-routing.module';
import { EncuestaRespuestasComponent } from '../../encuesta-respuestas/encuesta-respuestas.component';

@NgModule({
  imports: [CommonModule, EncuestaRoutingModule, EncuestaComponent, EncuestaRespuestasComponent]
})
export class EncuestaModule {}


