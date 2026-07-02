import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private supa: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    // ===== BYPASS LOCAL (Supabase caído) — poné bypassLogin en false para volver a la normalidad =====
    if (environment.bypassLogin) {
      console.warn('[AuthGuard] Bypass local activo: acceso permitido sin sesión.');
      return true;
    }
    // ===== FIN BYPASS =====

    const session = await this.supa.getSession();
    return session ? true : this.router.parseUrl('/login');
  }


}

  // constructor(private supa: SupabaseService, private router: Router) {}

  // async canActivate(): Promise<boolean | UrlTree> {
  //   const session = await this.supa.getSession();
  //   return session ? true : this.router.parseUrl('/login');
  // }




// import { Injectable } from '@angular/core';
// import {
//   CanActivate,
//   ActivatedRouteSnapshot,
//   RouterStateSnapshot,
//   Router
// } from '@angular/router';

// import { Observable } from 'rxjs';
// import { map, take, tap } from 'rxjs/operators';
// import { AuthService } from '../services/auth.service';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate {
//   constructor(
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): Observable<boolean> {
//     return this.authService.user$.pipe(
//       take(1),
//       map(user => !!user),        // convierte user a boolean
//       tap(loggedIn => {
//         if (!loggedIn) {
//           // no está autenticado → redirige al login
//           this.router.navigate(['/login']);
//         }
//       })
//     );
//   }
// }
