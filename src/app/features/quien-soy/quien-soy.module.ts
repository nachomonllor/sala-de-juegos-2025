// chat.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuienSoyRoutingModule } from './quien-soy-routing.module';

@NgModule({
  imports: [CommonModule, QuienSoyRoutingModule] // ChatComponent es standalone
})

export class QuienSoyModule{}

