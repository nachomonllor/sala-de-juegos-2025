import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { AuthService, User } from '../services/auth.service';
import { ResultsService } from '../services/results.service';
import { JUEGOS_HTML, JuegoHtml } from './juegos-html';

/**
 * Muestra un juego HTML autocontenido dentro de un iframe.
 * Si el juego envía con postMessage un mensaje
 *   { tipo: 'sala-juegos:resultado', juego: '<id>', puntaje: <número> }
 * y hay un usuario logueado, el puntaje se guarda con ResultsService.save (Supabase).
 */
@Component({
  selector: 'app-juego-html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="barra">
      <a routerLink="/home" class="volver">← Volver a la sala</a>
      <strong>{{ juego?.nombre }}</strong>
      <span class="aviso" [class.visible]="aviso">{{ aviso }}</span>
    </div>
    <iframe
      #marco
      *ngIf="url"
      [src]="url"
      [title]="juego?.nombre || 'Juego'"
      allow="fullscreen"
    ></iframe>
  `,
  styles: [`
    :host { display: block; background: #091321; }
    .barra {
      height: 48px; display: flex; align-items: center; gap: 16px;
      padding: 0 16px; background: #102034; color: #e7f1fc;
      border-bottom: 1px solid #2f4762; font-family: system-ui, sans-serif;
    }
    .volver { color: #63ead4; text-decoration: none; font-weight: 600; white-space: nowrap; }
    .volver:hover { text-decoration: underline; }
    strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .aviso { margin-left: auto; font-size: 14px; color: #ffd479; opacity: 0; transition: opacity .3s; }
    .aviso.visible { opacity: 1; }
    iframe { display: block; width: 100%; height: calc(100dvh - 48px); border: 0; }
  `],
})
export class JuegoHtmlComponent implements OnInit, OnDestroy {
  @ViewChild('marco') marco?: ElementRef<HTMLIFrameElement>;

  juego?: JuegoHtml;
  url?: SafeResourceUrl;
  aviso = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private auth = inject(AuthService);
  private results = inject(ResultsService);
  private zone = inject(NgZone);

  private usuario: User | null = null;
  private subs = new Subscription();
  private avisoTimer?: ReturnType<typeof setTimeout>;
  private onMessage = (e: MessageEvent) => this.zone.run(() => this.recibir(e));

  ngOnInit(): void {
    this.subs.add(this.route.paramMap.subscribe((p) => {
      const juego = JUEGOS_HTML.find((j) => j.id === p.get('id'));
      if (!juego) { this.router.navigate(['/home']); return; }
      this.juego = juego;
      // Solo se marcan como seguras las rutas del catálogo, nunca una URL que venga de afuera.
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(`/assets/juegos/${juego.archivo}`);
    }));
    this.subs.add(this.auth.user$.subscribe((u) => (this.usuario = u)));
    window.addEventListener('message', this.onMessage);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    window.removeEventListener('message', this.onMessage);
    clearTimeout(this.avisoTimer);
  }

  private async recibir(e: MessageEvent): Promise<void> {
    // Aceptar solo mensajes de nuestro propio sitio y del iframe de este juego
    if (e.origin !== window.location.origin) return;
    if (!this.marco || e.source !== this.marco.nativeElement.contentWindow) return;
    const d = e.data, juego = this.juego;
    if (!juego || !d || d.tipo !== 'sala-juegos:resultado' || d.juego !== juego.id) return;
    const puntaje = Number(d.puntaje);
    if (!Number.isFinite(puntaje) || puntaje < 0 || puntaje > 1_000_000) return;

    if (!this.usuario) {
      this.mostrar('Iniciá sesión para guardar tus puntajes.');
      return;
    }
    try {
      // ResultsService.save(game, score, meta): Supabase toma el usuario de la sesión actual
      await this.results.save(juego.codigo, Math.round(puntaje), this.limpiarDetalle(d.detalle));
      this.mostrar(`Puntaje guardado: ${Math.round(puntaje)}`);
    } catch {
      this.mostrar('No se pudo guardar el puntaje.');
    }
  }

  /** Guarda en meta solo valores simples (números, textos cortos, booleanos), nunca objetos arbitrarios. */
  private limpiarDetalle(detalle: unknown): Record<string, number | string | boolean> | null {
    if (!detalle || typeof detalle !== 'object') return null;
    const limpio: Record<string, number | string | boolean> = {};
    for (const [k, v] of Object.entries(detalle).slice(0, 10)) {
      if (typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v))) limpio[k] = v;
      else if (typeof v === 'string') limpio[k] = v.slice(0, 100);
    }
    return Object.keys(limpio).length ? limpio : null;
  }

  private mostrar(texto: string): void {
    this.aviso = texto;
    clearTimeout(this.avisoTimer);
    this.avisoTimer = setTimeout(() => (this.aviso = ''), 4000);
  }
}
