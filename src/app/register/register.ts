import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
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

    // Validaciones rápidas en front (opcional pero útil)
    if (!this.formulario.email?.trim()) {
      this.mensajeDeError = 'Ingresá un correo electrónico.';
      this.cargando = false; return;
    }
    if (!this.formulario.contrasenia || this.formulario.contrasenia.length < 6) {
      this.mensajeDeError = 'La contraseña debe tener al menos 6 caracteres.';
      this.cargando = false; return;
    }

    try {
      const { data, error } = await this.autenticacion.client.auth.signUp({
        email: this.formulario.email.trim(),
        password: this.formulario.contrasenia,
        options: { emailRedirectTo: window.location.origin + '/login' }
      });
      if (error) throw error;

      const usuario = data.user ?? null;

      // Si usás confirmación por email, normalmente no hay sesión todavía
      if (!usuario) {
        this.mensajeInformativo =
          'Revisá tu correo para confirmar la cuenta. Luego podés iniciar sesión.';
        await this.enrutador.navigate(['/login']);
        return;
      }

      // Si hubo autologin (confirmación desactivada), pasamos a Home
      await this.enrutador.navigate(['/home']);
    } catch (e: any) {
      console.error(e);
      this.mensajeDeError = this.traducirErrorRegistro(e);
    } finally {
      this.cargando = false;
    }
  }

  // --- Traducción de errores comunes de Supabase/Gotrue a castellano ---
  private traducirErrorRegistro(e: any): string {
    const msg = (e?.message || '').toLowerCase();
    const code = (e as any)?.code?.toString().toLowerCase?.() ?? '';
    const status = Number((e as any)?.status ?? 0);

    // Ya registrado
    if (
      code.includes('user_already_exists') ||
      msg.includes('already registered') ||
      msg.includes('already exists') ||
      status === 422
    ) {
      return 'Ese correo ya está registrado. Probá iniciar sesión o recuperar la contraseña.';
    }

    // Email inválido
    if (msg.includes('invalid email') || msg.includes('email not valid')) {
      return 'El correo no es válido.';
    }

    // Password corto o débil
    if (msg.includes('at least 6') || msg.includes('password should') || msg.includes('weak password')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    // Rate limit / demasiadas solicitudes
    if (msg.includes('too many') || msg.includes('rate limit') || status === 429) {
      return 'Demasiados intentos. Intentá nuevamente en unos minutos.';
    }

    // Errores de red/servidor
    if (status >= 500) {
      return 'Servidor temporalmente no disponible. Probá más tarde.';
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
      return 'No hay conexión. Verificá tu internet e intentá de nuevo.';
    }

    // Fallback
    return 'No se pudo completar el registro.';
  }

  // Utilidad por si la necesitás más adelante
  private calcularEdad(fechaIso: string): number {
    const d = new Date(fechaIso);
    const ahora = new Date();
    let edad = ahora.getFullYear() - d.getFullYear();
    const mes = ahora.getMonth() - d.getMonth();
    if (mes < 0 || (mes === 0 && ahora.getDate() < d.getDate())) edad--;
    return edad;
  }
}






// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../services/auth.service';

// @Component({
//   standalone: true,
//   selector: 'app-register',                     //  el selector como está para no romper rutas/plantillas
//   imports: [FormsModule, RouterLink, CommonModule],
//   templateUrl: './register.html',
//   styleUrls: ['./register.css']                 // (propiedad reservada de Angular)
// })
// export class RegisterComponent {
//   formulario = {
//     email: '',
//     contrasenia: '',
//     nombre: '',
//     apellido: '',
//     fechaNacimiento: ''
//   };

//   cargando = false;
//   mensajeDeError = '';
//   mensajeInformativo = '';

//   constructor(private enrutador: Router, private autenticacion: AuthService) {}

//   async registrarse() {
//     if (this.cargando) return;

//     this.cargando = true;
//     this.mensajeDeError = '';
//     this.mensajeInformativo = '';

//     try {
//       // 1) Crear usuario en el proveedor de autenticación
//       const { data, error } = await this.autenticacion.client.auth.signUp({
//         email: this.formulario.email.trim(),
//         password: this.formulario.contrasenia,
//         options: { emailRedirectTo: window.location.origin + '/login' }
//       });
//       if (error) throw error;

//       const usuario = data.user ?? null;

//       // 2) Si aún no hay sesión (confirmación por email), avisamos y vamos al login
//       if (!usuario) {
//         this.mensajeInformativo =
//           'Revisá tu correo para confirmar la cuenta. Tu perfil se creará al iniciar sesión por primera vez.';
//         await this.enrutador.navigate(['/login']);
//         return;
//       }

//       // 4) Ir al Home
//       await this.enrutador.navigate(['/home']);
//     } catch (e: any) {
//       console.error(e);
//       this.mensajeDeError = e?.message ?? 'No se pudo completar el registro.';
//     } finally {
//       this.cargando = false;
//     }
//   }

//   // Utilidad: calcular edad a partir de una fecha ISO (YYYY-MM-DD)
//   private calcularEdad(fechaIso: string): number {
//     const d = new Date(fechaIso);
//     const ahora = new Date();
//     let edad = ahora.getFullYear() - d.getFullYear();
//     const mes = ahora.getMonth() - d.getMonth();
//     if (mes < 0 || (mes === 0 && ahora.getDate() < d.getDate())) edad--;
//     return edad;
//   }
// }


