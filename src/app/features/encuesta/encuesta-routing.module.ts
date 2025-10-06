
// chat-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EncuestaComponent } from '../../encuesta/encuesta.component';

const routes: Routes = [{ path: '', component: EncuestaComponent }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })

export class EncuestaRoutingModule {}

