import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Carta {
  palo: 'oro' | 'espada' | 'copa' | 'basto';
  valor: number;     // 1–7, 10–12
  etiqueta: string;  // '1'..'7', '10', '11', '12'
}

type Adivinanza = 'mayor' | 'menor' | 'igual';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mayor-menor.component.html',
  styleUrls: ['./mayor-menor.component.css']
})
export class MayorMenorComponent implements OnInit {

  /** Jerarquía de palos: oro > espada > copa > basto */
  private jerarquiaPalo: Record<Carta['palo'], number> = {
    basto: 1,
    copa: 2,
    espada: 3,
    oro: 4,
  };

  mazo: Carta[] = [];
  cartaActual!: Carta;
  cartaSiguiente!: Carta;

  puntaje = 0;
  vidas = 3;
  mejorPuntaje = 0;
  juegoTerminado = false;
  nuevoRecord = false;

  ngOnInit() {
    // Migración de récord guardado (para no perder el valor anterior)
    const legacy = localStorage.getItem('bestScore');
    const actual = localStorage.getItem('mejorPuntaje');

    if (actual !== null) {
      this.mejorPuntaje = Number(actual);
    } else if (legacy !== null) {
      this.mejorPuntaje = Number(legacy);
      localStorage.setItem('mejorPuntaje', this.mejorPuntaje.toString());
    } else {
      this.mejorPuntaje = 0;
    }

    this.iniciarJuego();
  }

  iniciarJuego() {
    this.juegoTerminado = false;
    this.puntaje = 0;
    this.vidas = 3;
    this.construirMazo();
    this.barajarMazo();

    this.cartaActual = this.robarCarta();
    this.cartaSiguiente = this.robarCarta();

    console.log(`Carta actual: ${this.cartaActual.etiqueta} de ${this.cartaActual.palo}`);
    console.log(`Próxima carta: ${this.cartaSiguiente.etiqueta} de ${this.cartaSiguiente.palo}`);
  }

  construirMazo() {
    this.mazo = [];
    const palos: Carta['palo'][] = ['oro', 'espada', 'copa', 'basto'];
    const definiciones = [
      { valor: 1, etiqueta: '1' },
      { valor: 2, etiqueta: '2' },
      { valor: 3, etiqueta: '3' },
      { valor: 4, etiqueta: '4' },
      { valor: 5, etiqueta: '5' },
      { valor: 6, etiqueta: '6' },
      { valor: 7, etiqueta: '7' },
      { valor: 10, etiqueta: '10' },
      { valor: 11, etiqueta: '11' },
      { valor: 12, etiqueta: '12' },
    ];

    for (const palo of palos) {
      for (const def of definiciones) {
        this.mazo.push({ palo, valor: def.valor, etiqueta: def.etiqueta });
      }
    }
  }

  barajarMazo() {
    for (let i = this.mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.mazo[i], this.mazo[j]] = [this.mazo[j], this.mazo[i]];
    }
  }

  robarCarta(): Carta {
    const carta = this.mazo.pop();
    if (!carta) throw new Error('No quedan más cartas');
    return carta;
  }

  hacerAdivinanza(opcion: Adivinanza) {
    if (this.juegoTerminado) {
      this.finalizarJuego();
      return;
    }

    console.log(`Carta actual: ${this.cartaActual.etiqueta} de ${this.cartaActual.palo}`);
    console.log(`Próxima carta: ${this.cartaSiguiente.etiqueta} de ${this.cartaSiguiente.palo}`);

    const valAct = this.cartaActual.valor;
    const valSig = this.cartaSiguiente.valor;
    let acierto = false;

    if (opcion === 'mayor') {
      if (valSig > valAct) acierto = true;
      else if (valSig === valAct && this.jerarquiaPalo[this.cartaSiguiente.palo] > this.jerarquiaPalo[this.cartaActual.palo]) {
        acierto = true;
      }
    } else if (opcion === 'menor') {
      if (valSig < valAct) acierto = true;
      else if (valSig === valAct && this.jerarquiaPalo[this.cartaSiguiente.palo] < this.jerarquiaPalo[this.cartaActual.palo]) {
        acierto = true;
      }
    } else { // 'igual'
      if (valSig === valAct && this.cartaSiguiente.palo === this.cartaActual.palo) {
        acierto = true;
      }
    }

    // Avance de cartas
    this.cartaActual = this.cartaSiguiente;
    if (this.mazo.length > 0) {
      this.cartaSiguiente = this.robarCarta();
    }

    // Puntaje/Vidas
    if (acierto) {
      this.puntaje++;
    } else {
      this.vidas--;
      if (this.vidas <= 0) this.finalizarJuego();
    }

    if (!this.juegoTerminado && this.mazo.length > 0) {
      console.log(`Nueva próxima carta: ${this.cartaSiguiente.etiqueta} de ${this.cartaSiguiente.palo}`);
    }
  }

  finalizarJuego() {
    this.juegoTerminado = true;
    this.nuevoRecord = this.puntaje > this.mejorPuntaje;

    if (this.nuevoRecord) {
      this.mejorPuntaje = this.puntaje;
      localStorage.setItem('mejorPuntaje', this.mejorPuntaje.toString());
      localStorage.setItem('bestScore', this.mejorPuntaje.toString()); // compat
    }
  }

  obtenerImagenCarta(carta: Carta): string {
    // Mantengo la convención de nombres y extensión original
    return `assets/cards/${carta.etiqueta}_${carta.palo}.JPG`;
  }
}


// finalizarJuego() {
//   this.juegoTerminado = true;
//   if (this.puntaje > this.mejorPuntaje) {
//     this.mejorPuntaje = this.puntaje;
//     // Guardamos en clave nueva y también en la vieja por compatibilidad
//     localStorage.setItem('mejorPuntaje', this.mejorPuntaje.toString());
//     localStorage.setItem('bestScore', this.mejorPuntaje.toString());
//   }
// }



// // mayor-menor.component.ts
// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';

// export interface Card {
//   suit: 'oro' | 'espada' | 'copa' | 'basto';
//   value: number;          // 1–7, 10–12
//   label: string;          // '1'..'7', '10', '11', '12'
// }

// type Adivinanza = 'mayor' | 'menor' | 'igual';

// @Component({
//   selector: 'app-mayor-menor',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './mayor-menor.component.html',
//   styleUrls: ['./mayor-menor.component.css']
// })
// export class MayorMenorComponent implements OnInit {

//   /** Ranking de palos: oro > espada > copa > basto */
//   private suitRank: Record<Card['suit'], number> = {
//     basto: 1,
//     copa:  2,
//     espada:3,
//     oro:   4
//   };

//   deck: Card[] = [];
//   currentCard!: Card;
//   nextCard!: Card;

//   score = 0;
//   lives = 3;
//   bestScore = 0;
//   gameOver = false;

//   ngOnInit() {
//     this.bestScore = Number(localStorage.getItem('bestScore') || '0');
//     this.startGame();
//   }

//   startGame() {
//     this.gameOver = false;
//     this.score = 0;
//     this.lives = 3;
//     this.buildDeck();
//     this.shuffleDeck();
//     // Cargar carta actual y próxima
//     this.currentCard = this.drawCard();
//     this.nextCard    = this.drawCard();
//     console.log(`Carta actual: ${this.currentCard.label} de ${this.currentCard.suit}`);
//     console.log(`Próxima carta: ${this.nextCard.label} de ${this.nextCard.suit}`);
//   }

//   buildDeck() {
//     this.deck = [];
//     const suits: Card['suit'][] = ['oro', 'espada', 'copa', 'basto'];
//     const cardDefs = [
//       { value: 1, label: '1' },
//       { value: 2, label: '2' },
//       { value: 3, label: '3' },
//       { value: 4, label: '4' },
//       { value: 5, label: '5' },
//       { value: 6, label: '6' },
//       { value: 7, label: '7' },
//       { value: 10, label: '10' },
//       { value: 11, label: '11' },
//       { value: 12, label: '12' },
//     ];
//     for (let suit of suits) {
//       for (let card of cardDefs) {
//         this.deck.push({ suit, value: card.value, label: card.label });
//       }
//     }
//   }

//   shuffleDeck() {
//     for (let i = this.deck.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
//     }
//   }

//   drawCard(): Card {
//     const card = this.deck.pop();
//     if (!card) throw new Error('No quedan más cartas');
//     return card;
//   }

//   makeGuess(guess: Adivinanza) {
//     if (this.gameOver) {
//       this.finishGame();
//       return;
//     }

//     // Mostrar en consola carta actual y próxima antes de evaluar
//     console.log(`Carta actual: ${this.currentCard.label} de ${this.currentCard.suit}`);
//     console.log(`Próxima carta: ${this.nextCard.label} de ${this.nextCard.suit}`);

//     const cVal = this.currentCard.value;
//     const nVal = this.nextCard.value;
//     let correct = false;

//     if (guess === 'mayor') {
//       if (nVal > cVal) correct = true;
//       else if (nVal === cVal && this.suitRank[this.nextCard.suit] > this.suitRank[this.currentCard.suit])
//         correct = true;
//     } else if (guess === 'menor') {
//       if (nVal < cVal) correct = true;
//       else if (nVal === cVal && this.suitRank[this.nextCard.suit] < this.suitRank[this.currentCard.suit])
//         correct = true;
//     } else { // 'igual'
//       if (nVal === cVal && this.nextCard.suit === this.currentCard.suit)
//         correct = true;
//     }

//     // Avanzar: la próxima se convierte en actual
//     this.currentCard = this.nextCard;
//     // Extraer nueva próxima, si quedan cartas
//     if (this.deck.length > 0) {
//       this.nextCard = this.drawCard();
//     }

//     // Ajustar puntuación o penalización
//     if (correct) {
//       this.score++;
//     } else {
//       this.lives--;
//       if (this.lives <= 0) this.finishGame();
//     }

//     // Mostrar la nueva próxima carta en consola (opcional)
//     if (!this.gameOver && this.deck.length > 0) {
//       console.log(`Nueva próxima carta: ${this.nextCard.label} de ${this.nextCard.suit}`);
//     }
//   }

//   finishGame() {
//     this.gameOver = true;
//     if (this.score > this.bestScore) {
//       this.bestScore = this.score;
//       localStorage.setItem('bestScore', this.bestScore.toString());
//     }
//   }

//   getCardImage(card: Card): string {
//     return `assets/cards/${card.label}_${card.suit}.JPG`;
//   }
// }





// // mayor-menor.component.ts
// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';

// export interface Card {
//   suit: 'oro' | 'espada' | 'copa' | 'basto';
//   value: number;          // 1–7, 10–12
//   label: string;          // '1'..'7', '10', '11', '12'
// }

// @Component({
//   selector: 'app-mayor-menor',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './mayor-menor.component.html',
//   styleUrls: ['./mayor-menor.component.css']
// })
// export class MayorMenorComponent implements OnInit {

//    // Ranking de palos: oro > espada > copa > basto
//   private suitRank: Record<Card['suit'], number> = {
//     basto: 1,
//     copa:  2,
//     espada:3,
//     oro:   4
//   };

//   deck: Card[] = [];
//   currentCard!: Card;
//   nextCard!: Card;

//   score = 0;
//   lives = 3;
//   bestScore = 0;
//   gameOver = false;

//   ngOnInit() {
//     this.bestScore = Number(localStorage.getItem('bestScore') || '0');
//     this.startGame();
//   }

//   startGame() {
//     this.gameOver = false;
//     this.score = 0;
//     this.lives = 3;
//     this.buildDeck();
//     this.shuffleDeck();
//     // Cargar carta actual y próxima
//     this.currentCard = this.drawCard();
//     this.nextCard    = this.drawCard();
//     console.log(`Carta actual: ${this.currentCard.label} de ${this.currentCard.suit}`);
//     console.log(`Próxima carta: ${this.nextCard.label} de ${this.nextCard.suit}`);
//   }

//   buildDeck() {
//     this.deck = [];
//     const suits: Card['suit'][] = ['oro', 'espada', 'copa', 'basto'];
//     const cardDefs = [
//       { value: 1, label: '1' },
//       { value: 2, label: '2' },
//       { value: 3, label: '3' },
//       { value: 4, label: '4' },
//       { value: 5, label: '5' },
//       { value: 6, label: '6' },
//       { value: 7, label: '7' },
//       { value: 10, label: '10' },
//       { value: 11, label: '11' },
//       { value: 12, label: '12' },
//     ];
//     for (let suit of suits) {
//       for (let card of cardDefs) {
//         this.deck.push({ suit, value: card.value, label: card.label });
//       }
//     }
//   }

//   shuffleDeck() {
//     for (let i = this.deck.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
//     }
//   }

//   drawCard(): Card {
//     const card = this.deck.pop();
//     if (!card) throw new Error('No quedan más cartas');
//     return card;
//   }

//   makeGuess(guess: 'higher' | 'lower' | 'equal') {
//     if (this.gameOver) {
//       this.finishGame();
//       return;
//     }

//     // Mostrar en consola carta actual y próxima antes de evaluar
//     console.log(`Carta actual: ${this.currentCard.label} de ${this.currentCard.suit}`);
//     console.log(`Próxima carta: ${this.nextCard.label} de ${this.nextCard.suit}`);

//     const cVal = this.currentCard.value;
//     const nVal = this.nextCard.value;
//     let correct = false;

//     if (guess === 'higher') {
//       if (nVal > cVal) correct = true;
//       else if (nVal === cVal && this.suitRank[this.nextCard.suit] > this.suitRank[this.currentCard.suit])
//         correct = true;
//     } else if (guess === 'lower') {
//       if (nVal < cVal) correct = true;
//       else if (nVal === cVal && this.suitRank[this.nextCard.suit] < this.suitRank[this.currentCard.suit])
//         correct = true;
//     } else { // equal
//       if (nVal === cVal && this.nextCard.suit === this.currentCard.suit)
//         correct = true;
//     }

//     // Avanzar: la próxima se convierte en actual
//     this.currentCard = this.nextCard;
//     // Extraer nueva próxima, si quedan cartas
//     if (this.deck.length > 0) {
//       this.nextCard = this.drawCard();
//     }

//     // Ajustar puntuación o penalización
//     if (correct) {
//       this.score++;
//     } else {
//       this.lives--;
//       if (this.lives <= 0) this.finishGame();
//     }

//     // Mostrar la nueva próxima carta en consola (opcional)
//     if (!this.gameOver && this.deck.length > 0) {
//       console.log(`Nueva próxima carta: ${this.nextCard.label} de ${this.nextCard.suit}`);
//     }
//   }

//   finishGame() {
//     this.gameOver = true;
//     if (this.score > this.bestScore) {
//       this.bestScore = this.score;
//       localStorage.setItem('bestScore', this.bestScore.toString());
//     }
//   }

//   getCardImage(card: Card): string {
//     return `assets/cards/${card.label}_${card.suit}.JPG`;
//   }
// }




// ------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------
/*
// mayor-menor.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Card {
  suit: 'oro' | 'copa' | 'espada' | 'basto';
  value: number;          // 1–7, 10–12
  label: string;          // '1'..'7', 'Sota', 'Caballo', 'Rey'
}

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.css'
})

export class MayorMenorComponent implements OnInit {

  deck: Card[] = [];
  currentCard!: Card;
  nextCard!: Card;

  score = 0;
  lives = 3;
  bestScore = 0;
  gameOver = false;

  ngOnInit() {
    this.bestScore = Number(localStorage.getItem('bestScore') || '0');
    this.startGame();
  }

  startGame() {
    this.gameOver = false;
    this.score = 0;
    this.lives = 3;
    this.buildDeck();
    this.shuffleDeck();
    this.currentCard = this.drawCard();
  }

  buildDeck() {
    this.deck = [];
    const suits: Card['suit'][] = ['oro', 'copa', 'espada', 'basto'];
    const cardDefs = [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5' },
      { value: 6, label: '6' },
      { value: 7, label: '7' },
      { value: 10, label: '10' },
      { value: 11, label: '11' },
      { value: 12, label: '12' },
    ];
    for (let suit of suits) {
      for (let card of cardDefs) {
        this.deck.push({ suit, value: card.value, label: card.label });
      }
    }
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  drawCard(): Card {
    return this.deck.pop()!;
  }

  makeGuess(guess: 'higher' | 'lower' | 'equal') {
    if (this.gameOver || this.deck.length === 0) {
      this.finishGame();
      return;
    }

    this.nextCard = this.drawCard();
    const c = this.currentCard.value;
    const n = this.nextCard.value;
    let correct = false;

    if (guess === 'higher' && n > c) correct = true;
    if (guess === 'lower'  && n < c) correct = true;
    if (guess === 'equal'  && n === c) correct = true;

    if (correct) {
      this.score++;
      this.currentCard = this.nextCard;
    } else {
      this.lives--;
      if (this.lives <= 0) this.finishGame();
    }
  }

  finishGame() {
    this.gameOver = true;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('bestScore', this.bestScore.toString());
    }
  }

  getCardImage(card: Card): string {
    return `assets/cards/${card.label}_${card.suit}.JPG`;
  }

}
*/

