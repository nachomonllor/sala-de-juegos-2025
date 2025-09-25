// ⛔️ eliminá cualquier interface ChatMessage local en este archivo
// ✅ importá el tipo del servicio y usalo

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SupabaseService,
  type ChatMessage as SupaChatMessage   // 👈
} from '../services/supabase.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: SupaChatMessage[] = [];       // 👈 usar el tipo del servicio
  text = '';
  room = 'global';
  private unsubscribe?: () => void;

  constructor(private supa: SupabaseService) { }

  async ngOnInit() {
    this.messages = await this.supa.listChatMessages(this.room, 50);
    this.unsubscribe = this.supa.subscribeToChat(this.room, (msg) => {
      this.messages.push(msg);             // ahora los tipos coinciden
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }

  async send() {
    const value = this.text.trim();
    if (!value) return;
    await this.supa.addChatMessage(this.room, value);
    this.text = '';
  }
}



// // chat.component.ts
// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { SupabaseService } from '../services/supabase.service';

// export interface ChatMessage {
//   id?: string;
//   uid: string;
//   email: string;
//   text: string;
//   timestamp: any;
// }

// @Component({
//   selector: 'app-chat',
//   standalone: true,
//   imports: [CommonModule, FormsModule],  // Agrega CommonModule, FormsModule, RouterModule si los necesitas
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.css']
// })
// export class ChatComponent implements OnInit, OnDestroy {
//   messages: ChatMessage[] = [];
//   text = '';
//   room = 'global';
//   private unsubscribe?: () => void;

//   constructor(private supa: SupabaseService) {}

//   async ngOnInit() {
//     this.messages = await this.supa.listChatMessages(this.room, 50);
//     this.unsubscribe = this.supa.subscribeToChat(this.room, (msg) => {
//       this.messages.push(msg);
//     });
//   }

//   ngOnDestroy() {
//     this.unsubscribe?.();
//   }

//   async send() {
//     const value = this.text.trim();
//     if (!value) return;
//     await this.supa.addChatMessage(this.room, value);
//     this.text = '';
//   }
// }


