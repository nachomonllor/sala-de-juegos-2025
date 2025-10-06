// chat.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncuestaComponent } from '../../encuesta/encuesta.component';
import { EncuestaRoutingModule } from './encuesta-routing.module';

@NgModule({
  imports: [CommonModule, EncuestaRoutingModule, EncuestaComponent] // ChatComponent es standalone
})
export class EncuestaModule {}


