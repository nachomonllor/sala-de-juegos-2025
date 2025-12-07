import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';
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

  constructor(
    private enrutador: Router,
    private servicioAuth: AuthService,
    private supabaseSvc: SupabaseService
  ) {}

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

    // Verificar/crear usuario en esquema_juegos.usuarios y registrar login
    const usuario = data.user;
    if (usuario) {
      try {
        // Verificar si el usuario existe en esquema_juegos.usuarios
        let usuarioId = await this.supabaseSvc.getUsuarioIdFromSupabaseUid(usuario.id);
        
        // Si no existe (caso edge: usuario creado antes de la migración), crearlo con datos mínimos
        if (!usuarioId) {
          const nombre = usuario.email?.split('@')[0] || 'Usuario';
          usuarioId = await this.supabaseSvc.createUsuarioInEsquemaJuegos(
            nombre,
            null,
            usuario.email || '',
            null,
            usuario.id
          );
        }

        // Registrar login en esquema_juegos.log_logins
        if (usuarioId) {
          await this.supabaseSvc.logLogin(usuario.id);
        }
      } catch (error: any) {
        console.warn('Error al verificar/crear usuario o registrar login:', error);
        // No bloqueamos el login por esto
      }
    }

    await this.enrutador.navigate(['/home']);
    this.cargando = false;
  }
}

// ---------------------------------------------------------------------------------------

/*
# Estando en la rama de trabajo
git status
git add .
git commit -m "mensaje"
git push origin ultima-fecha

# Pasar a main y actualizar
git checkout main
git pull origin main

# Mergear
git merge ultima-fecha

# Resolver conflictos si los hay:
# (editar archivos, luego)
git add .
git commit  # solo si hubo conflictos

# Subir main (deploy)
git push origin main

*/