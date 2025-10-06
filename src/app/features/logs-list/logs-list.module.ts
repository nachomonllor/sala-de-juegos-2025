

// chat.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogsListRoutingModule } from './logs-list-routing.module';
import { LogsListComponent } from '../../logs-list/logs-list.component';

@NgModule({
  imports: [CommonModule, LogsListRoutingModule, LogsListComponent] 
})

export class LogsListModule{}

