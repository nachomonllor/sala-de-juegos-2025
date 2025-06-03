import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  CollectionReference,
  addDoc,
  collectionData,
  query,
  orderBy,
  Timestamp,
  DocumentData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameResult } from '../models/result.models';

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private resultsCollection: CollectionReference<GameResult>;

  constructor(private firestore: Firestore) {
    // <-- Aquí aplicamos el casting
    this.resultsCollection = collection(this.firestore, 'gameResults') as CollectionReference<GameResult>;
  }

  /** Guarda un resultado en Firestore */
  async saveResult(result: Omit<GameResult, 'id'>): Promise<void> {
    const toSave: any = {
      userId: result['userId'],
      userEmail: result['userEmail'],
      game: result['game'],
      score: result['score'],
      date: Timestamp.fromDate(result['date'])
    };
    await addDoc(this.resultsCollection, toSave);
  }

  /** Devuelve todos los resultados ordenados por fecha descendente */
  getAllResults(): Observable<GameResult[]> {
    // query inferirá GameResult porque resultsCollection ya está casteada
    const q = query(this.resultsCollection, orderBy('date', 'desc'));

    return collectionData<GameResult>(q, { idField: 'id' }).pipe(
      map((docs: DocumentData[]) =>
        docs.map(doc => ({
          id: doc['id'],
          userId: doc['userId'],
          userEmail: doc['userEmail'],
          game: doc['game'],
          score: doc['score'],
          date: doc['date'] && (doc['date'] as any)?.toDate
            ? (doc['date'] as any).toDate()
            : new Date(doc['date'])
        }))
      )
    );
  }
}




// import { Injectable } from '@angular/core';
// import {
//   Firestore,
//   collection,
//   CollectionReference,
//   addDoc,
//   collectionData,
//   query,
//   orderBy,
//   Timestamp,
//   DocumentData
// } from '@angular/fire/firestore';

// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { GameResult } from '../models/result.models';
 
// @Injectable({ providedIn: 'root' })
// export class ResultsService {
//   //private resultsCollection: any; // Sólo declaración
//   private resultsCollection: CollectionReference<GameResult>;

//   constructor(private firestore: Firestore) {
//     // Inicializamos aquí, cuando `firestore` sí existe
//     this.resultsCollection = collection(this.firestore, 'gameResults');
//   }

//   /** Guarda un resultado en Firestore */
//   async saveResult(result: Omit<GameResult, 'id'>): Promise<void> {
//     const toSave: any = {
//       userId: result.userId,
//       userEmail: result.userEmail,
//       game: result.game,
//       score: result.score,
//       date: Timestamp.fromDate(result.date)
//     };
//     await addDoc(this.resultsCollection, toSave);
//   }

//   getAllResults(): Observable<GameResult[]> {
//       // Ahora query infiere que trabaja sobre documentos GameResult
//       const q = query<GameResult>(this.resultsCollection, orderBy('date', 'desc'));

//       return collectionData<GameResult>(q, { idField: 'id' }).pipe(
//         map((docs: DocumentData[]) =>
//           docs.map(doc => ({
//             id: doc['id'],
//             userId: doc['userId'],
//             userEmail: doc['userEmail'],
//             game: doc['game'],
//             score: doc['score'],
//             date: doc['date'] && (doc['date'] as any)?.toDate
//               ? (doc['date'] as any).toDate()
//               : new Date(doc['date'])
//           }))
//         )
//       );
//     }

// }
