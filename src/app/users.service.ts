// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class UsersService {

//   constructor() { }
// }


import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from './models/user.models';

@Injectable({ providedIn: 'root' })

export class UsersService {
  constructor(private firestore: Firestore) {}

  getUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>;
  }
}




// // src/app/users.service.ts
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { User } from './models/user.models';

// @Injectable({ providedIn: 'root' })
// export class UsersService {
//   constructor(private firestore: Firestore) {}

//   getUsers(): Observable<User[]> {
//     // Crea una referencia a la colección "users"
//     const usersRef = collection(this.firestore, 'users');
//     // Devuelve un Observable<User[]> e incluye el id en cada objeto
//     return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>;
//   }
// }













// import { Injectable } from '@angular/core';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { User } from './models/user.models';

// @Injectable({ providedIn: 'root' })
// export class UsersService {
//   constructor(private db: AngularFirestore) {}

//   getUsers(): Observable<User[]> {
//     return this.db.collection('users')
//       .snapshotChanges()
//       .pipe(
//         map(snaps => snaps.map(snap => {
//           const data = snap.payload.doc.data() as any;
//           return {
//             id:        snap.payload.doc.id,
//             firstName: data.firstName,
//             lastName:  data.lastName,
//             email:     data.email,
//             gamePlays: data.gamePlays || {}
//           } as User;
//         }))
//       );
//   }
// }
