import { Component }                       from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { FormsModule }                     from '@angular/forms';

import { signInWithEmailAndPassword }      from 'firebase/auth';
import { collection, addDoc }              from 'firebase/firestore';

import { Auth }                            from '@angular/fire/auth';
import { Firestore }                       from '@angular/fire/firestore';
import { LogsListComponent }               from "../logs-list/logs-list.component";

import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LogsListComponent, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  email    = '';
  password = '';
  error: string | null = null;

  constructor(
    private auth: Auth,
    private db: Firestore,
    private router: Router       // <— aquí
  ) {}
  
  async onSubmit() {
    this.error = null;
    try {
      // 1) Autentica
      const cred = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      // 2) Registra log
      await addDoc(collection(this.db, 'loginLogs'), {
        uid:   cred.user.uid,
        email: cred.user.email,
        fecha: new Date()
      });
      // 3) Éxito
      console.log('Ingreso registrado');
      this.router.navigate(['/home']);   // <— navega al Home

    } catch(err: any) {
      console.error(err);
      this.error = err.message;
    }
  }
}


