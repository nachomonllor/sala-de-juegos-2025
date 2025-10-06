
// chat.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from '../../chat/chat.component';

@NgModule({
  imports: [CommonModule, ChatRoutingModule, ChatComponent] // ChatComponent es standalone
})
export class ChatModule {}

