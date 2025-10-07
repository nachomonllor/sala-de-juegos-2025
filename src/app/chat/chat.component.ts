import { Component, OnDestroy, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  SupabaseService,
  type ChatMessage as SupaChatMessage
} from '../services/supabase.service';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextFieldModule } from '@angular/cdk/text-field';

type UIStatus = 'sending' | 'failed' | 'sent';
type UIMessage = SupaChatMessage & { localId?: string; status?: UIStatus; errorMsg?: string };

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatDividerModule,
    MatSnackBarModule, MatProgressSpinnerModule, TextFieldModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  // Estado
  messages: UIMessage[] = [];
  messageIds = new Set<number | string>(); // evita duplicados (server: number, local: string)
  text = '';
  room = 'global';
  userId: string | null = null;
  displayName = 'Anónimo';
  sending = false;

  private unsubscribe?: () => void;

  // typing
  private typingCtl?: { notifyTyping: (name: string, user_id: string) => void; unsubscribe: () => void };
  private lastTypingSent = 0;
  private typingMap = new Map<string, number>(); // name -> last timestamp
  private typingCleaner?: any;

  constructor(private supa: SupabaseService, private snack: MatSnackBar) { }

  async ngOnInit() {
    const { data: { session } } = await this.supa.client.auth.getSession();
    this.userId = session?.user?.id ?? null;
    // Nombre visible: parte local del email (robusto y sin “full_name”)
    this.displayName = session?.user?.email?.split('@')[0] ?? 'Anónimo';

    // Carga inicial
    this.messages = (await this.supa.listChatMessages(this.room, 50)).map(m => ({ ...m, status: 'sent' }));
    this.messages.forEach(m => {
      if (m.id !== null && m.id !== undefined) this.messageIds.add(m.id);
    });
    this.scrollToBottom();

    // Realtime mensajes
    this.unsubscribe = this.supa.subscribeToChat(this.room, (msg) => {
      if (this.messageIds.has(msg.id)) return; // ya lo mostramos
      this.messageIds.add(msg.id);
      this.messages = [...this.messages, { ...msg, status: 'sent' }];
      this.scrollToBottom();
    });

    // Canal "typing"
    this.typingCtl = this.supa.connectTyping(this.room, ({ user_id, name }) => {
      if (user_id === this.userId) return;
      this.typingMap.set(name || 'Alguien', Date.now());
    });

    // Limpieza periódica de typing (expira a los 2.5s)
    this.typingCleaner = setInterval(() => {
      const now = Date.now();
      for (const [k, t] of this.typingMap) {
        if (now - t > 2500) this.typingMap.delete(k);
      }
    }, 1000);
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.unsubscribe?.();
    this.typingCtl?.unsubscribe();
    clearInterval(this.typingCleaner);
  }

  async send() {
    const value = this.text.trim();
    if (!value || !this.userId) return;

    const localId = 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    const optimistic: UIMessage = {
      id: -1,                  // placeholder numérico (evita choque con tipo number del server)
      localId,
      room: this.room,
      message: value,
      user_id: this.userId,
      display_name: this.displayName,
      created_at: new Date().toISOString(),
      status: 'sending'
    };

    this.messages = [...this.messages, optimistic];
    this.text = '';
    this.scrollToBottom();

    try {
      const inserted = await this.supa.addChatMessage(this.room, value); // debe devolver la fila
      this.messageIds.add(inserted.id);

      // Reemplaza el optimista por el real
      const idx = this.messages.findIndex(m => m.localId === localId);
      if (idx !== -1) {
        this.messages[idx] = { ...inserted, status: 'sent' };
      } else {
        this.messages = [...this.messages, { ...inserted, status: 'sent' }];
      }
    } catch (e: any) {
      const idx = this.messages.findIndex(m => m.localId === localId);
      if (idx !== -1) {
        this.messages[idx] = { ...optimistic, status: 'failed', errorMsg: e?.message ?? 'Error al enviar' };
      }
      // this.snack.open('No se pudo enviar el mensaje', 'OK', { duration: 3000 });

      console.error('Error al insertar mensaje:', e);
      this.snack.open(e?.message ?? 'No se pudo enviar el mensaje', 'OK', { duration: 3000 });
      // ...

    }
  }

  retry(m: UIMessage) {
    if (!m || !m.message) return;
    const idx = this.messages.findIndex(x => x.localId === m.localId);
    if (idx !== -1) this.messages[idx] = { ...m, status: 'sending', errorMsg: undefined };

    this.supa.addChatMessage(this.room, m.message)
      .then(inserted => {
        this.messageIds.add(inserted.id);
        const i = this.messages.findIndex(x => x.localId === m.localId);
        if (i !== -1) this.messages[i] = { ...inserted, status: 'sent' };
        this.scrollToBottom();
      })
      .catch(err => {
        const i = this.messages.findIndex(x => x.localId === m.localId);
        if (i !== -1) this.messages[i] = { ...m, status: 'failed', errorMsg: err?.message ?? 'Error al enviar' };
      });
  }

  handleEnter(ev: KeyboardEvent) {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.send();
      return;
    }
    this.triggerTyping();
  }

  triggerTyping() {
    if (!this.userId || !this.typingCtl) return;
    const now = Date.now();
    if (now - this.lastTypingSent < 900) return; // throttle ~1s
    this.lastTypingSent = now;
    this.typingCtl.notifyTyping(this.displayName, this.userId);
  }

  get typingIndicator(): string | null {
    const names = Array.from(this.typingMap.keys());
    if (!names.length) return null;
    if (names.length === 1) return `${names[0]} está escribiendo…`;
    if (names.length === 2) return `${names[0]} y ${names[1]} están escribiendo…`;
    return `Varias personas están escribiendo…`;
  }

  isMine(m: SupaChatMessage): boolean {
    return !!this.userId && (m as any).user_id === this.userId;
  }

  trackById = (i: number, m: UIMessage) => m.id ?? m.localId ?? i;

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollContainer?.nativeElement;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }
}




// import { Component, OnDestroy, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// import {
//   SupabaseService,
//   type ChatMessage as SupaChatMessage
// } from '../services/supabase.service';

// // Angular Material
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatCardModule } from '@angular/material/card';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatSnackBar } from '@angular/material/snack-bar';

// type UIStatus = 'sending' | 'failed' | 'sent';
// type UIMessage = SupaChatMessage & { localId?: string; status?: UIStatus; errorMsg?: string };


// @Component({
//   selector: 'app-chat',
//   standalone: true,
//   imports: [
//     CommonModule, FormsModule,
//     MatToolbarModule, MatIconModule, MatButtonModule,
//     MatFormFieldModule, MatInputModule, MatCardModule, MatDividerModule
//   ],
//   templateUrl: './chat.component.html',
//   styleUrls: ['./chat.component.css']
// })
// export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
//   @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

//   // messages: SupaChatMessage[] = [];
//   text = '';
//   room = 'global';
//   userId: string | null = null;

//   trackById = (_: number, m: any) => m?.id ?? m?.created_at ?? _;

//   private unsubscribe?: () => void;


//   //-----------------------

//   messages: UIMessage[] = [];
//   messageIds = new Set<string>(); // para evitar duplicados de Realtime


//   displayName = 'Anónimo';

//   sending = false;

//   // typing
//   private typingCtl?: { notifyTyping: (name: string, user_id: string) => void; unsubscribe: () => void };
//   private lastTypingSent = 0;
//   private typingMap = new Map<string, number>(); // name -> last timestamp
//   private typingCleaner?: any;


//   constructor(private supa: SupabaseService, private snack: MatSnackBar) { }

//   async ngOnInit() {
//     const { data: { session } } = await this.supa.client.auth.getSession();
//     this.userId = session?.user?.id ?? null;
//     this.displayName =
//       (session?.user?.user_metadata?.full_name as string) ||
//       (session?.user?.email?.split('@')[0] ?? 'Anónimo');

//     // Carga inicial
//     this.messages = await this.supa.listChatMessages(this.room, 50);
//     this.messages.forEach(m => m.status = 'sent');
//     this.messages.forEach(m => m.id && this.messageIds.add(m.id));
//     this.scrollToBottom();

//     // Realtime mensajes
//     this.unsubscribe = this.supa.subscribeToChat(this.room, (msg) => {
//       if (this.messageIds.has(msg.id)) return; // ya lo mostramos
//       this.messageIds.add(msg.id);
//       this.messages = [...this.messages, { ...msg, status: 'sent' }];
//       this.scrollToBottom();
//     });

//     // Canal "typing"
//     this.typingCtl = this.supa.connectTyping(this.room, ({ user_id, name }) => {
//       if (user_id === this.userId) return;
//       this.typingMap.set(name || 'Alguien', Date.now());
//     });

//     // Limpieza periódica de typing (expira a los 2.5s)
//     this.typingCleaner = setInterval(() => {
//       const now = Date.now();
//       for (const [k, t] of this.typingMap) {
//         if (now - t > 2500) this.typingMap.delete(k);
//       }
//     }, 1000);
//   }

//   ngOnDestroy() {
//     this.unsubscribe?.();
//     this.typingCtl?.unsubscribe();
//     clearInterval(this.typingCleaner);
//   }


//   async send() {
//     const value = this.text.trim();
//     if (!value || !this.userId) return;

//     const localId = 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2);
//     const optimistic: UIMessage = {
//       id: localId, localId,
//       room: this.room,
//       message: value,
//       user_id: this.userId,
//       display_name: this.displayName,
//       created_at: new Date().toISOString(),
//       status: 'sending'
//     };

//     this.messages = [...this.messages, optimistic];
//     this.text = '';
//     this.scrollToBottom();

//     try {
//       const inserted = await this.supa.addChatMessage(this.room, value);
//       this.messageIds.add(inserted.id);

//       // Reemplaza el optimista por el real
//       const idx = this.messages.findIndex(m => m.localId === localId);
//       if (idx !== -1) {
//         this.messages[idx] = { ...inserted, status: 'sent' };
//       } else {
//         // si no está (por timing), lo agregamos
//         this.messages = [...this.messages, { ...inserted, status: 'sent' }];
//       }
//     } catch (e: any) {
//       const idx = this.messages.findIndex(m => m.localId === localId);
//       if (idx !== -1) {
//         this.messages[idx] = { ...optimistic, status: 'failed', errorMsg: e?.message ?? 'Error al enviar' };
//       }
//       this.snack.open('No se pudo enviar el mensaje', 'OK', { duration: 3000 });
//     }
//   }

//   retry(m: UIMessage) {
//     if (!m || !m.message) return;
//     // marcar como reintento
//     const idx = this.messages.findIndex(x => x.localId === m.localId);
//     if (idx !== -1) this.messages[idx] = { ...m, status: 'sending', errorMsg: undefined };
//     // reusar send de servicio, pero sin duplicar en UI
//     this.supa.addChatMessage(this.room, m.message)
//       .then(inserted => {
//         this.messageIds.add(inserted.id);
//         const i = this.messages.findIndex(x => x.localId === m.localId);
//         if (i !== -1) this.messages[i] = { ...inserted, status: 'sent' };
//         this.scrollToBottom();
//       })
//       .catch(err => {
//         const i = this.messages.findIndex(x => x.localId === m.localId);
//         if (i !== -1) this.messages[i] = { ...m, status: 'failed', errorMsg: err?.message ?? 'Error al enviar' };
//       });
//   }

//   handleEnter(ev: KeyboardEvent) {
//     if (ev.key === 'Enter' && !ev.shiftKey) {
//       ev.preventDefault();
//       this.send();
//       return;
//     }
//     this.triggerTyping();
//   }

//   triggerTyping() {
//     if (!this.userId || !this.typingCtl) return;
//     const now = Date.now();
//     if (now - this.lastTypingSent < 900) return; // throttle ~1s
//     this.lastTypingSent = now;
//     this.typingCtl.notifyTyping(this.displayName, this.userId);
//   }

//   get typingIndicator(): string | null {
//     const names = Array.from(this.typingMap.keys());
//     if (!names.length) return null;
//     if (names.length === 1) return `${names[0]} está escribiendo…`;
//     if (names.length === 2) return `${names[0]} y ${names[1]} están escribiendo…`;
//     return `Varias personas están escribiendo…`;
//   }

//   // --------------------------------------------------------------------------------------------

//   // async ngOnInit() {
//   //   // Identidad del usuario para alinear burbujas
//   //   const { data: { session } } = await this.supa.client.auth.getSession();
//   //   this.userId = session?.user?.id ?? null;

//   //   // Carga inicial + suscripción en tiempo real
//   //   this.messages = await this.supa.listChatMessages(this.room, 50);
//   //   this.scrollToBottom();

//   //   this.unsubscribe = this.supa.subscribeToChat(this.room, (msg) => {
//   //     // Inmutabilidad para disparar change detection fácilmente
//   //     this.messages = [...this.messages, msg];
//   //     this.scrollToBottom();
//   //   });

//   //   this.displayName = session?.user?.email?.split('@')[0] ?? 'Anónimo';

//   // }

//   ngAfterViewInit(): void {
//     this.scrollToBottom();
//   }

//   // ngOnDestroy() {
//   //   this.unsubscribe?.();
//   // }

//   // async send() {
//   //   const value = this.text.trim();
//   //   if (!value) return;
//   //   await this.supa.addChatMessage(this.room, value);
//   //   this.text = '';
//   //   this.scrollToBottom();
//   // }

//   // // Enviar con Enter, salto de línea con Shift+Enter
//   // handleEnter(ev: KeyboardEvent) {
//   //   if (ev.key === 'Enter' && !ev.shiftKey) {
//   //     ev.preventDefault();
//   //     this.send();
//   //   }
//   // }

//   isMine(m: SupaChatMessage): boolean {
//     // Asumimos que el mensaje trae 'user_id' (típico de Supabase).
//     // Si tu key se llama distinto, cámbiala aquí.
//     return !!this.userId && (m as any).user_id === this.userId;
//   }

//   private scrollToBottom() {
//     // Espera al renderizado
//     setTimeout(() => {
//       const el = this.scrollContainer?.nativeElement;
//       if (!el) return;
//       el.scrollTop = el.scrollHeight;
//     });
//   }


// }




