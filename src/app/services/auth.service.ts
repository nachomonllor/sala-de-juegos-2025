// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  email: string;
  uid: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private afAuth: Auth) {
    //  ← Aquí nos suscribimos al estado de Firebase Auth
    authState(this.afAuth).subscribe((fbUser: FirebaseUser | null) => {
      if (fbUser) {
        this.userSubject.next({ email: fbUser.email || '', uid: fbUser.uid });
      } else {
        this.userSubject.next(null);
      }
    });
  }

  /** Envía las credenciales a Firebase */
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.afAuth, email, password);
  }

  /** Crea usuario + login */
  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.afAuth, email, password);
  }

  /** Cierra la sesión en Firebase */
  async logout(): Promise<void> {
    await signOut(this.afAuth);
  }
}

// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   constructor() { }
// }

