// chat.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Firestore, collection, addDoc, collectionData, query, orderBy, serverTimestamp } from '@angular/fire/firestore';
import { filter, take, tap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '@supabase/supabase-js';
import { AuthService } from '../services/auth.service';

export interface ChatMessage {
  id?: string;
  uid: string;
  email: string;
  text: string;
  timestamp: any;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],  // Agrega CommonModule, FormsModule, RouterModule si los necesitas
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages$: Observable<ChatMessage[]>;
  newMessage = '';
  currentUser!: User;

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {
    // Prepara el stream de mensajes ordenados por fecha
    const chatQuery = query(
      collection(this.firestore, 'chatMessages'),
      orderBy('timestamp', 'asc')
    );
    this.messages$ = collectionData(chatQuery, { idField: 'id' }) as Observable<ChatMessage[]>;
  }

  ngOnInit(): void {
    // Espera a usuario autenticado para obtener datos
    this.authService.user$
      .pipe(
        filter(user => !!user),
        take(1),
        tap(user => this.currentUser = user!)  
      )
      .subscribe();
  }

  async sendMessage(): Promise<void> {
    const text = this.newMessage.trim();
    if (!text) return;

    await addDoc(collection(this.firestore, 'chatMessages'), {
      uid: this.currentUser.id,
      email: this.currentUser.email,
      text,
      timestamp: serverTimestamp()
    });

    this.newMessage = '';
  }
}


// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-chat',
//   imports: [],
//   templateUrl: './chat.component.html',
//   styleUrl: './chat.component.css'
// })
// export class ChatComponent {

// }