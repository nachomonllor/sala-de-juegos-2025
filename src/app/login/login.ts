import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

type UsuarioAccesoRapido = { etiqueta: string; correo: string; contrasenia: string };

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  formulario = { correo: '', contrasenia: '' };
  mensajeDeError = '';
  cargando = false;

  // Leemos desde environment
  usuariosAccesoRapido: UsuarioAccesoRapido[] = environment.demoUsers;
  get mostrarAccesoRapido(): boolean { return !!environment.accesoRapidoHabilitado; }

  constructor(private enrutador: Router, private servicioAuth: AuthService) {}

  autocompletarAccesoRapido(u: UsuarioAccesoRapido) {
    this.formulario.correo = u.correo;
    this.formulario.contrasenia = u.contrasenia;
  }

  async ingresar() {
    this.mensajeDeError = '';
    this.cargando = true;

    const { data, error } = await this.servicioAuth.signIn(
      this.formulario.correo.trim(),
      this.formulario.contrasenia.trim()
    );

    if (error) {
      console.log({
        name: error.name,
        code: (error as any).code,
        status: (error as any).status,
        msg: error.message
      });

      switch ((error as any).code) {
        case 'invalid_credentials':
          this.mensajeDeError = 'Email o contraseña inválidos.';
          break;
        case 'email_not_confirmed':
          this.mensajeDeError = 'Tenés que confirmar tu email antes de ingresar.';
          break;
        default:
          this.mensajeDeError = error.message;
          break;
      }
      this.cargando = false;
      return;
    }

    // (Opcional) Traer perfil
    const usuario = data.user;
    if (usuario) {
      const { data: datosPerfil, error: errorPerfil } = await this.servicioAuth.client
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', usuario.id)
        .maybeSingle();

      if (errorPerfil) {
        console.warn('No se pudo leer el perfil (profiles):', errorPerfil.message);
      } else {
        console.log('Perfil:', datosPerfil);
      }
    }

    await this.enrutador.navigate(['/home']);
    this.cargando = false;
  }
}

// ---------------------------------------------------------------------------------------


// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../services/auth.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [FormsModule, CommonModule, RouterLink],
//   templateUrl: './login.html',
//   styleUrl: './login.css'
// })
// export class LoginComponent {
//   form = { email: '', password: '' };
//   errorMsg = '';

//   constructor(private router: Router, private auth: AuthService) { }

//   async login() {
//     this.errorMsg = '';

//     // 1) Login en Supabase Auth
//     const { data, error } = await this.auth.signIn(this.form.email.trim(), this.form.password);


//     // Antes
//     // const { data, error } = await this.auth.signIn(this.form.email.trim(), this.form.password.trim());

//     // Después (si no necesitas {data, error})
//     //await this.auth.login(this.form.email.trim(), this.form.password.trim());

//     if (error) {
//       // Log estructurado para depurar rápido
//       console.log({
//         name: error.name,
//         code: (error as any).code,   // p.ej. 'invalid_credentials', 'email_not_confirmed'
//         status: (error as any).status, // p.ej. 400/401
//         msg: error.message
//       });

//       // Mensajes amigables según código (fallback al message por defecto)
//       switch ((error as any).code) {
//         case 'invalid_credentials':
//           this.errorMsg = 'Email o contraseña inválidos.';
//           break;
//         case 'email_not_confirmed':
//           this.errorMsg = 'Tenés que confirmar tu email antes de ingresar.';
//           break;
//         default:
//           this.errorMsg = error.message;
//           break;
//       }
//       return;
//     }

//     console.log('Login ok!', { data });

//     // Si necesitás, podés guardar data.session en un store/servicio.
//     // 2) (Opcional) Traer perfil de tu tabla 'profiles'
//     const user = data.user;
//     if (user) {
//       const { data: profileData, error: profileError } = await this.auth.client
//         .from('profiles')
//         .select('id, first_name, last_name, email')
//         .eq('id', user.id)
//         .maybeSingle();

//       if (profileError) {
//         console.warn('No se pudo leer el perfil (profiles):', profileError.message);
//         // No frenamos el login por esto.
//       } else {
//         // Si necesitás, podés guardar profileData en un store/servicio.
//         console.log('Perfil:', profileData);
//       }
//     }

//     // 3) Navegar a Home
//     await this.router.navigate(['/home']);
//   }
// }

