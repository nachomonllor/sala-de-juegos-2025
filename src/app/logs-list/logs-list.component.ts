
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginLog, SupabaseService } from '../services/supabase.service';

export interface LogEntry {
  id: string;
  uid: string;
  email: string;
  fecha: any;
}

@Component({
  selector: 'app-logs-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // si necesitas CommonModule u otros, agrégalos aquí
  templateUrl: './logs-list.component.html',
  styleUrls: ['./logs-list.component.css']
})
export class LogsListComponent implements OnInit {
  logs: LoginLog[] = [];
  error: string | null = null;

  constructor(private supa: SupabaseService) {}

  async ngOnInit() {
    try {
      this.logs = await this.supa.getLoginLogs(100);
    } catch (e: any) {
      this.error = e?.message ?? 'Error al cargar logs';
    }
  }
}

// export class LogsListComponent implements OnInit {
//   logs: LogEntry[] = [];

//   constructor(
//     private db: Firestore,
//     private authService: AuthService
//   ) {}

//   ngOnInit(): void {
//     // 1) Esperamos a que el usuario esté autenticado
//     this.authService.user$
//       .pipe(
//         filter(user => !!user), // continúa sólo si user != null
//         take(1)                 // nos suscribimos una sola vez
//       )
//       .subscribe({
//         next: () => this.fetchLogs(),
//         error: err => console.error('Error en auth subscription:', err)
//       });
//   }

//   private async fetchLogs(): Promise<void> {
//     try {
//       // 2) Traemos los docs de la colección
//       const snapshot = await getDocs(collection(this.db, 'loginLogs'));

//       // 3) Mappeamos a nuestro tipo LogEntry
//       this.logs = snapshot.docs.map((doc: { data: () => any; id: any; }) => {
//         const data = doc.data() as any;
//         return {
//           id:    doc.id,
//           uid:   data.uid,
//           email: data.email,
//           fecha: data.fecha
//         };
//       });

//       console.log('📥 Logs recuperados:', this.logs);
//     } catch (err) {
//       console.error('❌ Error al recuperar logs:', err);
//     }
//   }
// }






// import { Component, OnInit }         from '@angular/core';
// import { CommonModule }              from '@angular/common';
// import { Firestore, collection, getDocs } from '@angular/fire/firestore';

// import { AuthService }           from '../services/auth.service';
// import { filter, take }          from 'rxjs/operators';


// @Component({
//   selector: 'app-logs-list',
//   standalone: true,
//   imports: [ CommonModule ],
//   templateUrl: './logs-list.component.html',
//   styleUrls: ['./logs-list.component.css']
// })

// export class LogsListComponent implements OnInit {
//   logs: Array<{ id: string; [key: string]: any }> = [];

//   constructor(
//     private db: Firestore,
//     private authService: AuthService
//   ) {}

//   ngOnInit() {
//     // Espera al primer valor no-null de user$, luego carga logs
//     this.authService.user$
//       .pipe(
//         filter(user => !!user),  // ignora null
//         take(1)                  // solo el primero
//       )
//       .subscribe({
//         next: () => this.fetchLogs(),
//         error: err => console.error('Error en auth subscription:', err)
//       });
//   }

//   private async fetchLogs() {
//     try {
//       const snapshot = await getDocs(collection(this.db, 'loginLogs'));
//       this.logs = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...(doc.data() as any)
//       }));
//       console.log('📥 Logs recuperados:', this.logs);
//     } catch (err) {
//       console.error('❌ Error al recuperar logs:', err);
//     }
//   }
// }

