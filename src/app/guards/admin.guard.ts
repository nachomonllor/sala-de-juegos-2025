import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private readonly supa: SupabaseService,
    private readonly router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const session = await this.supa.getSession();
    const user = session?.user;
    if (!user) {
      return this.router.parseUrl('/login');
    }

    const { data, error } = await this.supa.client
      .schema('esquema_juegos')
      .from('usuarios')
      .select('es_admin')
      .eq('supabase_uid', user.id)
      .maybeSingle();

    if (error) {
      console.error('[AdminGuard] Error verificando rol admin:', error);
      return this.router.parseUrl('/home');
    }

    return data?.es_admin ? true : this.router.parseUrl('/home');
  }
}

