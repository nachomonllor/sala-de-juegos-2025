import { Component, OnInit }         from '@angular/core';
import { CommonModule }              from '@angular/common';

import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-logs-list',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './logs-list.component.html',
  styleUrls: ['./logs-list.component.css']
})
export class LogsListComponent implements OnInit {
  logs: { id: string; 
          email: string; 
          fecha: any  
        }[] = [];

  constructor(private db: Firestore) {}

  async ngOnInit() {
    // 1) Recupera todos los documentos de loginLogs
    const snapshot = await getDocs(collection(this.db, 'loginLogs'));
    // 2) Transforma al array que usarás en la vista
    this.logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
  }
}

