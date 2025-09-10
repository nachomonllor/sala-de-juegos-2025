import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;
  loading = false;

  constructor(private supa: SupabaseService, private router: Router) {}

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.error = 'Completá email y contraseña.';
      return;
    }
    this.error = null;
    this.loading = true;
    try {
      const { user } = await this.supa.signIn(this.email, this.password);
      if (!user) {
        this.error = 'No se pudo iniciar sesión.';
        return;
      }
      await this.supa.logLogin(user.id, user.email ?? this.email);
      this.router.navigate(['/home']);
    } catch (err: unknown) {
      console.error(err);
      this.error = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión.';
    } finally {
      this.loading = false;
    }
  }

  quickAccess(user: string, pass: string) {
    this.email = user;
    this.password = pass;
    void this.onSubmit();
  }
}




// --------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------


// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { Inject } from '@angular/core';
// import { SupabaseService } from '../services/supabase.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })
// export class LoginComponent {
//   email = '';
//   password = '';
//   error: string | null = null;

//   constructor(
//     @Inject(SupabaseService) private supa: SupabaseService,
//     private router: Router
//   ) {}

//   async onSubmit() {
//     this.error = null;
//     try {
//       const result = await this.supa.signIn(this.email, this.password);
//       if (!result || !result.user) {
//         this.error = 'No se pudo iniciar sesión.';
//         return;
//       }
//       await this.supa.logLogin(result.user.id, result.user.email ?? this.email);
//       this.router.navigate(['/home']);
//     } catch (err: any) {
//       console.error(err);
//       this.error = err?.message ?? 'Error inesperado al iniciar sesión.';
//     }
//   }

//   quickAccess(user: string, pass: string) {
//     this.email = user;
//     this.password = pass;
//     this.onSubmit();
//   }
// }



// --------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------


// import { Component }                       from '@angular/core';
// import { CommonModule }                    from '@angular/common';
// import { FormsModule }                     from '@angular/forms';

// import { signInWithEmailAndPassword }      from 'firebase/auth';
// import { collection, addDoc }              from 'firebase/firestore';

// import { Auth }                            from '@angular/fire/auth';
// import { Firestore }                       from '@angular/fire/firestore';

// import { Router } from '@angular/router';
// import { RouterModule } from '@angular/router';


// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css']
// })

// export class LoginComponent {
//   email    = '';
//   password = '';
//   error: string | null = null;

//   constructor(
//     private auth: Auth,
//     private db: Firestore,
//     private router: Router       // <— aquí
//   ) {}
  
//   async onSubmit() {
//     this.error = null;
//     try {
//       // 1) Autentica
//       const cred = await signInWithEmailAndPassword(this.auth, this.email, this.password);
//       // 2) Registra log
//       await addDoc(collection(this.db, 'loginLogs'), {
//         uid:   cred.user.uid,
//         email: cred.user.email,
//         fecha: new Date()
//       });
//       // 3) Éxito
//       console.log('Ingreso registrado');
//       this.router.navigate(['/home']);   // <— navega al Home

//     } catch(err: any) {
//       console.error(err);
//       this.error = err.message;
//     }
//   }

//   quickAccess(user: string, pass: string) {
//     this.email = user;
//     this.password = pass;
//     this.onSubmit();
//   }

// }


