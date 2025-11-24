import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EncuestaRespuestasService, EncuestaRespuestaAdmin } from '../services/encuesta-respuestas.service';

@Component({
  selector: 'app-encuesta-respuestas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <section class="admin-respuestas">
      <mat-toolbar color="primary" class="toolbar">
        <span>Respuestas de la encuesta</span>
        <span class="flex-spacer"></span>
        <button mat-icon-button aria-label="Recargar" (click)="recargar()" [disabled]="cargando()">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-toolbar>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar por nombre, email o teléfono</mat-label>
        <input matInput (input)="onFiltroChange($event)" [value]="textoFiltro()">
        <button matSuffix mat-icon-button aria-label="Limpiar" *ngIf="textoFiltro()" (click)="limpiarFiltro()">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>

      <mat-progress-bar mode="indeterminate" *ngIf="cargando()"></mat-progress-bar>

      <div *ngIf="error()" class="error-banner">
        <mat-icon color="warn">error</mat-icon>
        <span>{{ error() }}</span>
      </div>

      <div *ngIf="!cargando() && !error() && respuestasFiltradas().length === 0" class="empty">
        <mat-icon>hourglass_empty</mat-icon>
        <p>No hay respuestas que coincidan con el filtro.</p>
      </div>

      <div class="cards" *ngIf="!cargando() && !error()">
        <mat-card *ngFor="let r of respuestasFiltradas()" class="respuesta-card">
          <mat-card-title>{{ r.nombreApellido }}</mat-card-title>
          <mat-card-subtitle>
            <span class="info-item">Edad: <strong>{{ r.edad }}</strong></span>
            <span class="separator">•</span>
            <span class="info-item">Teléfono: <strong>{{ r.telefono }}</strong></span>
            <span class="separator">•</span>
            <span class="info-item">Fecha: <strong>{{ r.completadaEn | date:'short' }}</strong></span>
          </mat-card-subtitle>

          <div class="usuario-info" *ngIf="r.usuario">
            <mat-icon>person</mat-icon>
            <span>
              <ng-container *ngIf="r.usuario.nombre || r.usuario.apellido">
                <strong>{{ r.usuario.nombre || '' }} {{ r.usuario.apellido || '' }}</strong>
                <ng-container *ngIf="r.usuario.email"> <span class="email">({{ r.usuario.email }})</span></ng-container>
              </ng-container>
              <ng-container *ngIf="!r.usuario.nombre && !r.usuario.apellido && r.usuario.email">
                <strong>{{ r.usuario.email }}</strong>
              </ng-container>
            </span>
          </div>

          <section class="respuestas" *ngIf="r.respuestas && r.respuestas.length > 0">
            <h4 class="respuestas-title">Respuestas:</h4>
            <div *ngFor="let detalle of r.respuestas" class="respuesta-detalle">
              <div class="pregunta">{{ detalle.textoPregunta }}</div>
              <div class="respuesta">
                <span class="respuesta-texto">{{ detalle.valorLibre || detalle.opcionTexto || 'Sin respuesta' }}</span>
                <span class="respuesta-meta" *ngIf="detalle.opcionValor && !detalle.valorLibre">
                  (código: {{ detalle.opcionValor }})
                </span>
              </div>
            </div>
          </section>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    .admin-respuestas {
      max-width: 1100px;
      margin: 1rem auto;
      padding: 0 1rem 2rem;
      display: block;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .toolbar {
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .flex-spacer {
      flex: 1 1 auto;
    }

    .search-field {
      width: 100%;
      margin-bottom: 1rem;
      background: white;
      border-radius: 8px;
      padding: 0.5rem;
    }

    .cards {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .respuesta-card {
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      background: white;
      border: 1px solid #e0e0e0;
      padding: 1.5rem;
    }

    .respuesta-card mat-card-title {
      color: #1976d2;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .respuesta-card mat-card-subtitle {
      color: #666;
      font-size: 0.95rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e0e0e0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .info-item {
      color: #555;
    }

    .info-item strong {
      color: #1976d2;
      font-weight: 600;
    }

    .separator {
      color: #bbb;
    }

    .email {
      color: #666;
      font-size: 0.9em;
    }

    .usuario-info {
      display: flex;
      align-items: center;
      gap: .5rem;
      margin-top: 1rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f0f7ff;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .usuario-info mat-icon {
      color: #1976d2;
    }

    .usuario-info span {
      color: #333;
      font-weight: 500;
    }

    .respuestas {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .respuestas-title {
      color: #495057;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #dee2e6;
    }

    .respuesta-detalle {
      padding: 1rem 1.25rem;
      border-radius: 10px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-left: 4px solid #28a745;
      transition: all 0.2s ease;
    }

    .respuesta-detalle:hover {
      background: #e9ecef;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .pregunta {
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #212529;
      font-size: 1rem;
      line-height: 1.4;
    }

    .respuesta {
      font-size: 1rem;
      color: #495057;
      line-height: 1.6;
      padding-left: 0.5rem;
    }

    .respuesta-texto {
      color: #212529;
      font-weight: 500;
    }

    .respuesta-meta {
      font-size: 0.85rem;
      color: #6c757d;
      margin-left: 0.75rem;
      font-style: italic;
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .error-banner,
    .empty {
      display: flex;
      gap: .75rem;
      align-items: center;
      padding: 1rem 1.25rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .error-banner {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffc107;
    }

    .empty {
      background: #e7f3ff;
      color: #004085;
      border: 1px solid #b3d7ff;
    }

    mat-progress-bar {
      margin-bottom: 1rem;
      border-radius: 4px;
    }
  `]
})
export class EncuestaRespuestasComponent implements OnInit {
  respuestas = signal<EncuestaRespuestaAdmin[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  textoFiltro = signal('');

  respuestasFiltradas = computed(() => {
    const filtro = this.textoFiltro().toLowerCase().trim();
    if (!filtro) {
      return this.respuestas();
    }

    return this.respuestas().filter(r => {
      const blob = [
        r.nombreApellido,
        r.telefono,
        r.usuario?.email,
        r.usuario?.nombre,
        r.usuario?.apellido,
      ].filter(Boolean).join(' ').toLowerCase();
      return blob.includes(filtro);
    });
  });

  constructor(private readonly encuestaSrv: EncuestaRespuestasService) {}

  ngOnInit(): void {
    this.cargar();
  }

  async recargar(): Promise<void> {
    await this.cargar();
  }

  onFiltroChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.textoFiltro.set(value);
  }

  limpiarFiltro(): void {
    this.textoFiltro.set('');
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const data = await this.encuestaSrv.listRespuestas(200);
      this.respuestas.set(data);
    } catch (err: any) {
      console.error('[EncuestaRespuestasComponent] Error cargando respuestas', err);
      this.error.set(err?.message ?? 'Error al cargar respuestas');
    } finally {
      this.cargando.set(false);
    }
  }
}

