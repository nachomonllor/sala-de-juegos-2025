import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { SupabaseService } from '../services/supabase.service';
import Swal from 'sweetalert2';

interface Concepto {
  id: string;
  texto: string;
}

interface DefinicionSlot {
  id: string;
  definicion: string;
  conceptoAnclado: Concepto[]; // Es un array para que el CDK DropList funcione fácil (tendrá 0 o 1 elemento)
}

@Component({
  selector: 'app-gen-game',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatCardModule, MatButtonModule],
  templateUrl: './gen-game.component.html',
  styleUrls: ['./gen-game.component.scss']
})
export class GenGameComponent implements OnInit {
  
  private todosLosConceptos: any[] = []; 

  conceptosDisponibles: Concepto[] = [];
  definiciones: DefinicionSlot[] = [];
  dropListIds: string[] = [];

  constructor(private sb: SupabaseService) {}

  // Convertimos el ngOnInit a async para poder esperar la respuesta de Supabase
  async ngOnInit() {
    await this.cargarConceptosDesdeBD();
  }

  async cargarConceptosDesdeBD() {
    try {
      // Hacemos el select directamente a la nueva tabla
      const { data, error } = await this.sb.client
        .schema('esquema_juegos')
        .from('conceptos_biologia')
        .select('*');

      if (error) throw error;

      this.todosLosConceptos = data || [];
      
      // Una vez que tenemos los datos, iniciamos la partida
      this.iniciarJuego();

    } catch (error) {
      console.error('Error al cargar conceptos desde Supabase:', error);
      Swal.fire('Error', 'No se pudieron cargar los conceptos del juego.', 'error');
    }
  }

  iniciarJuego() {
    if (this.todosLosConceptos.length === 0) return;

    // 1. Elegir 5 conceptos AL AZAR de la base de datos
    const conceptosMezclados = [...this.todosLosConceptos].sort(() => Math.random() - 0.5);
    const conceptosSeleccionados = conceptosMezclados.slice(0, 5);

    // 2. Llenar los "conceptosDisponibles" (Izquierda) mezclándolos de nuevo
    this.conceptosDisponibles = [...conceptosSeleccionados]
      .sort(() => Math.random() - 0.5)
      // Mapeamos a los nombres de columna que creamos en SQL (codigo y concepto)
      .map(c => ({ id: c.codigo, texto: c.concepto }));

    // 3. Preparar los huecos de "definiciones" (Derecha)
    this.definiciones = conceptosSeleccionados.map(c => ({
      id: c.codigo, 
      definicion: c.definicion,
      conceptoAnclado: []
    }));

    // 4. Conectar listas para el Drag & Drop
    this.dropListIds = ['lista-conceptos', ...this.definiciones.map(d => 'slot-' + d.id)];
  }



  // -------------------------------------------------------------------------------------------------

  // Lista de conceptos que el usuario va a arrastrar (se mezclan al inicio)
 //conceptosDisponibles: Concepto[] = [];

  // // Los "huecos" con las definiciones donde hay que soltar los conceptos
  // definiciones: DefinicionSlot[] = [
  //   {
  //     id: 'endosimbiosis',
  //     definicion: 'Explica el origen evolutivo de las organelas celulares.',
  //     conceptoAnclado: []
  //   },
  //   {
  //     id: 'dogma',
  //     definicion: 'Postula que el ADN actúa como portador de la información para luego expresarse en ARN.',
  //     conceptoAnclado: []
  //   },
  //   {
  //     id: 'meiosis',
  //     definicion: 'Proceso de división celular clave para la reproducción y las bases de la herencia.',
  //     conceptoAnclado: []
  //   },
  //   {
  //     id: 'deriva',
  //     definicion: 'Fuerza evolutiva que actúa junto a las mutaciones, migración y selección natural.',
  //     conceptoAnclado: []
  //   },
  //   {
  //     id: 'nicho',
  //     definicion: 'Concepto de ecología que se divide en sus variantes fundamental y real.',
  //     conceptoAnclado: []
  //   }

  // ];

  // // IDs para conectar todas las zonas de drop
  // dropListIds: string[] = [];

  // constructor(private sb: SupabaseService) {}

  // ngOnInit(): void {
  //   this.iniciarJuego();
  // }

  // iniciarJuego() {
  //   // Conceptos originales
  //   const conceptos: Concepto[] = [
  //     { id: 'endosimbiosis', texto: 'Teoría Endosimbiótica' },
  //     { id: 'dogma', texto: 'Dogma Central' },
  //     { id: 'meiosis', texto: 'Meiosis' },
  //     { id: 'deriva', texto: 'Deriva Génica' },
  //     { id: 'nicho', texto: 'Nicho Ecológico' }
  //   ];

  //   // Mezclar conceptos aleatoriamente
  //   this.conceptosDisponibles = conceptos.sort(() => Math.random() - 0.5);
    
  //   // Limpiar slots si se está reiniciando
  //   this.definiciones.forEach(def => def.conceptoAnclado = []);

  //   // Conectar la lista principal con los huecos
  //   this.dropListIds = ['lista-conceptos', ...this.definiciones.map(d => 'slot-' + d.id)];
  // }

  // Lógica principal de Drag & Drop
  drop(event: CdkDragDrop<Concepto[]>, slotEsperadoId?: string) {
    if (event.previousContainer === event.container) {
      // Si lo soltó en el mismo lugar, no hacemos nada
      return;
    }

    const conceptoArrastrado = event.previousContainer.data[event.previousIndex];

    // Si estamos soltando en un hueco de definición
    if (slotEsperadoId) {
      // ¿Es correcto el match?
      if (conceptoArrastrado.id === slotEsperadoId) {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.verificarVictoria();
      } else {
        // Error: No coincide. CDK automáticamente hace que la tarjeta vuelva a su origen con animación.
        // Opcional: Mostrar un feedback visual rápido
        this.mostrarFeedbackError();
      }
    } 
    // Si estamos devolviendo un concepto a la lista principal desde un hueco
    else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  mostrarFeedbackError() {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
    Toast.fire({ icon: 'error', title: 'Concepto incorrecto. ¡Pensalo bien!' });
  }

  async verificarVictoria() {
    // Si ya no quedan conceptos en la lista principal, el usuario ganó
    if (this.conceptosDisponibles.length === 0) {
      Swal.fire({
        title: '¡Genial, Nacho!',
        text: 'Demostraste excelentes conocimientos de Biología.',
        icon: 'success',
        confirmButtonText: 'Guardar Puntaje'
      }).then(async (result: { isConfirmed: any; }) => {
        if (result.isConfirmed) {
          try {
            // Guardamos el resultado usando tu método de la sala de juegos
            await this.sb.saveResult('gen_game', 100, { dificultad: 'Básica', temas: 'Biología General' });
            Swal.fire('Guardado', 'Puntaje registrado en la base de datos', 'success');
          } catch (error) {
            console.error(error);
          }
        }
      });
    }
  }
}






// import { Component } from '@angular/core';
// @Component({
//   selector: 'app-gen-game',
//   imports: [],
//   templateUrl: './gen-game.component.html',
//   styleUrl: './gen-game.component.css'
// })
// export class GenGameComponent {

// }
