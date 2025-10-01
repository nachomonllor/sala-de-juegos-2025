
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',                     //  el selector como está para no romper rutas/plantillas
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']                 // (propiedad reservada de Angular)
})
export class RegisterComponent {
  formulario = {
    email: '',
    contrasenia: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: ''
  };

  cargando = false;
  mensajeDeError = '';
  mensajeInformativo = '';

  constructor(private enrutador: Router, private autenticacion: AuthService) {}

  async registrarse() {
    if (this.cargando) return;

    this.cargando = true;
    this.mensajeDeError = '';
    this.mensajeInformativo = '';

    try {
      // 1) Crear usuario en el proveedor de autenticación
      const { data, error } = await this.autenticacion.client.auth.signUp({
        email: this.formulario.email.trim(),
        password: this.formulario.contrasenia,
        options: { emailRedirectTo: window.location.origin + '/login' }
      });
      if (error) throw error;

      const usuario = data.user ?? null;

      // 2) Si aún no hay sesión (confirmación por email), avisamos y vamos al login
      if (!usuario) {
        this.mensajeInformativo =
          'Revisá tu correo para confirmar la cuenta. Tu perfil se creará al iniciar sesión por primera vez.';
        await this.enrutador.navigate(['/login']);
        return;
      }

      // 3) (Opcional futuro) Guardar/actualizar perfil en tu tabla propia
      //    Si tu esquema usa 'edad', podés calcularla así:
      // const edad = this.formulario.fechaNacimiento
      //   ? this.calcularEdad(this.formulario.fechaNacimiento)
      //   : undefined;
      //
      // insertar/actualizar en 'users_data' con:
      // await this.autenticacion.client.from('users_data').upsert({
      //   auth_id: usuario.id,
      //   nombre: this.formulario.nombre || null,
      //   apellido: this.formulario.apellido || null,
      //   fecha_nacimiento: this.formulario.fechaNacimiento || null,
      //   edad
      // });

      // 4) Ir al Home
      await this.enrutador.navigate(['/home']);
    } catch (e: any) {
      console.error(e);
      this.mensajeDeError = e?.message ?? 'No se pudo completar el registro.';
    } finally {
      this.cargando = false;
    }
  }

  // Utilidad: calcular edad a partir de una fecha ISO (YYYY-MM-DD)
  private calcularEdad(fechaIso: string): number {
    const d = new Date(fechaIso);
    const ahora = new Date();
    let edad = ahora.getFullYear() - d.getFullYear();
    const mes = ahora.getMonth() - d.getMonth();
    if (mes < 0 || (mes === 0 && ahora.getDate() < d.getDate())) edad--;
    return edad;
  }
}




// // src/app/components/register/register.component.ts
// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../services/auth.service';

// @Component({
//   standalone: true,
//   selector: 'app-register',
//   imports: [FormsModule, RouterLink, CommonModule],
//   templateUrl: './register.html',
//   styleUrls: ['./register.css']   // ← plural
// })
// export class RegisterComponent {
//   form = { email: '', password: '', first_name: '', last_name: '', birthDate: '' }; // ← fecha de nacimiento
//   loading = false;
//   mensajeDeError = '';
//   infoMsg = '';

//   constructor(private router: Router, private auth: AuthService) {}

//   async registrarse() {
//     if (this.loading) return;
//     this.loading = true;
//     this.mensajeDeError = '';
//     this.infoMsg = '';

//     try {
//       // 1) Crear usuario
//       const { data, error } = await this.auth.client.auth.signUp({
//         email: this.form.email.trim(),
//         password: this.form.password,
//         options: { emailRedirectTo: window.location.origin + '/login' }
//       });
//       if (error) throw error;

//       const user = data.user ?? null;

//       // 2) Si no hay sesión aún (confirmación por mail), avisamos y vamos a login
//       if (!user) {
//         this.infoMsg = 'Revisá tu email para confirmar la cuenta. Tu perfil se creará al primer login.';
//         await this.router.navigate(['/login']);
//         return;
//       }

//       // 3) Crear/asegurar perfil
//       //    Si tu tabla aún tiene `age`, calculamos edad desde birthDate (back-compat).
//       // const payload: any = {
//       //   name: this.form.name || undefined,
//       //   birth_date: this.form.birthDate || undefined,
//       //   age: this.form.birthDate ? this.calcAge(this.form.birthDate) : undefined
//       // };
//       //await this.auth.ensureProfile(user, payload);
//       const payload: any = {
//         first_name: this.form.first_name || undefined,
//         last_name: this.form.last_name || undefined,
//         birth_date: this.form.birthDate || undefined,
//        // age: this.form.birthDate ? this.calcAge(this.form.birthDate) : undefined

//        age: this.form.birthDate ? this.calcAge(this.form.birthDate) : undefined

        
//       };


//       // 4) Ir a Home
//       await this.router.navigate(['/home']);
//     } catch (err: any) {
//       console.error(err);
//       this.mensajeDeError = err?.message ?? 'No se pudo registrar.';
//     } finally {
//       this.loading = false;
//     }
//   }

//   // Helper: calcula edad si tu schema todavía usa `age`
//   private calcAge(iso: string): number {
//     const d = new Date(iso);
//     const now = new Date();
//     let age = now.getFullYear() - d.getFullYear();
//     const m = now.getMonth() - d.getMonth();
//     if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
//     return age;
//   }
// }







// // src/app/components/register/register.component.ts
// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../services/auth.service';

// const STORAGE_BUCKET = 'images'; // Cambiá si tu bucket tiene otro nombre

// @Component({
//   standalone: true,
//   selector: 'app-register',
//   imports: [FormsModule, RouterLink, CommonModule  ],
//   templateUrl: './register.html',
//   styleUrl: './register.css'
// })
// export class RegisterComponent {
//   form = { email: '', password: '', name: '', age: null as number | null };
//   avatarFile: File | null = null;
//   loading = false;
//   errorMsg = '';
//   infoMsg = '';

//   constructor(private router: Router, private auth: AuthService) { }

//   onFileSelected(ev: Event) {
//     const input = ev.target as HTMLInputElement;
//     this.avatarFile = input.files?.[0] ?? null;
//   }

//   private async uploadAvatarOrNull(userId: string): Promise<string | null> {
//     if (!this.avatarFile) return null;

//     try {
//       const filePath = `avatars/${userId}/${Date.now()}_${this.avatarFile.name}`;
//       const { error: upErr } = await this.auth.client
//         .storage.from(STORAGE_BUCKET)
//         .upload(filePath, this.avatarFile, { upsert: true });

//       if (upErr) {
//         // Toleramos bucket inexistente
//         console.warn('Avatar omitido (upload):', upErr.message ?? upErr);
//         return null;
//       }

//       const { data: pub } = this.auth.client.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
//       return pub?.publicUrl ?? null;
//     } catch (e: any) {
//       console.warn('Avatar omitido (catch):', e?.message ?? e);
//       return null;
//     }
//   }

//   async register() {
//     if (this.loading) return;
//     this.loading = true;
//     this.errorMsg = '';
//     this.infoMsg = '';

//     try {
//       // 1) Crear usuario en Auth
//       const { data, error } = await this.auth.client.auth.signUp({
//         email: this.form.email.trim(),
//         password: this.form.password,
//         options: { emailRedirectTo: window.location.origin + '/login' } // opcional
//       });
//       if (error) throw error;

//       // ¿Hay sesión inmediatamente? (Auto-confirm ON)
//       const user = data.user ?? null;

//       if (!user) {
//         // Sin sesión → por RLS no podemos insertar ahora.
//         this.infoMsg = 'Revisá tu email para confirmar la cuenta. Tu perfil se creará automáticamente al primer login.';
//         await this.router.navigate(['/login']);
//         return;
//       }

//       // 2) Subir avatar (si hay bucket y archivo)
//       const avatar_url = await this.uploadAvatarOrNull(user.id);

//       // ⬇️ cambia esta línea de ensureProfile:
//       await this.auth.ensureProfile(user, {
//         name: this.form.name,
//         age: this.form.age ?? undefined,
//         avatar_url: avatar_url ?? undefined   // <- evita el error TS2322
//       });


//       // 4) Ir a Home
//       await this.router.navigate(['/home']);
//     } catch (err: any) {
//       console.error(err);
//       this.errorMsg = err?.message ?? 'No se pudo registrar.';
//     } finally {
//       this.loading = false;
//     }
//   }

// }





// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AuthService } from '../../services/auth';
// import { CommonModule } from '@angular/common';

// @Component({
//   standalone: true,
//   selector: 'app-register',
//   imports: [FormsModule, CommonModule],
//   templateUrl: './register.html',
//   styleUrl: './register.css'
// })
// export class RegisterComponent {
//   form = { email: '', password: '', name: '', age: null as number | null };
//   avatarFile: File | null = null;
//   loading = false;
//   errorMsg = '';

//   constructor(private router: Router, private auth: AuthService) { }

//   onFileSelected(ev: Event) {
//     const input = ev.target as HTMLInputElement;
//     this.avatarFile = input.files?.[0] ?? null;
//   }

//   async register() {
//     if (this.loading) return;
//     this.loading = true;
//     this.errorMsg = '';

//     try {
//       // 1) Crear usuario en Auth
//       const { data, error } = await this.auth.client.auth.signUp({
//         email: this.form.email.trim(),
//         password: this.form.password,
//         options: { emailRedirectTo: window.location.origin + '/login' } // opcional
//       });
//       if (error) throw error;

//       // Si tu proyecto exige confirmar email, data.user existe pero puede no haber sesión.
//       const user = data.user;
//       if (!user) {
//         // Sin sesión porque falta confirmar email → redirigimos a login.
//         await this.router.navigate(['/login']);
//         return;
//       }

//       // 2) Subir avatar (opcional)
//       let avatarUrl: string | null = null;
//       if (this.avatarFile) {
//         const filePath = `avatars/${user.id}/${Date.now()}_${this.avatarFile.name}`;
//         const { data: up, error: upErr } = await this.auth.client
//           .storage.from('images')
//           .upload(filePath, this.avatarFile, { upsert: true });
//         if (upErr) throw upErr;

//         // Public URL (si el bucket es público). Si no lo es, usá signed URLs.
//         const { data: pub } = this.auth.client.storage.from('images').getPublicUrl(up.path);
//         avatarUrl = pub.publicUrl ?? null;
//       }

//       // 3) Guardar perfil en tu tabla
//       const { error: insertErr } = await this.auth.client
//         .from('users_data')
//         .insert({
//           authId: user.id,
//           name: this.form.name,
//           age: this.form.age,
//           avatarUrl
//         });
//       if (insertErr) throw insertErr;

//       // 4) Ir a Home
//       await this.router.navigate(['/home']);
//     } catch (err: any) {
//       console.error(err);
//       this.errorMsg = err?.message ?? 'No se pudo registrar.';
//     } finally {
//       this.loading = false;
//     }
//   }
// }


// // import { Component } from '@angular/core';
// // @Component({
// //   selector: 'app-register',
// //   imports: [],
// //   templateUrl: './register.html',
// //   styleUrl: './register.css'
// // })
// // export class Register {
// // }
