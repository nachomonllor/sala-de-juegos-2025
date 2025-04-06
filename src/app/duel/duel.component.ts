import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Question, QuestionsData, QuestionService } from '../question.service';

@Component({
  selector: 'app-duel',
  imports: [CommonModule, FormsModule],
  templateUrl: './duel.component.html',
  styleUrl: './duel.component.css'
})

export class DuelComponent implements OnInit {
  // Diccionario anidado: cada temática (key) contiene un diccionario de preguntas y respuestas.
  questions: { [theme: string]: { [question: string]: string } } = {
    "historia": {
      "¿Cuál es la capital de Francia?": "París",
      "¿En qué año llegó el hombre a la luna?": "1969",
      "¿Cuál es el océano más grande del mundo?": "Pacífico",
      "¿Quién pintó la Mona Lisa?": "Leonardo da Vinci",
      "¿Cuál es el animal terrestre más rápido?": "Guepardo"
    },
    "geografia": {
      "¿Cuál es el río más largo de la Península Ibérica?": "Río Tajo",
      "¿Cuál es el país más pequeño del mundo?": "Ciudad o Estado Vaticano",
      "¿Cuántos océanos hay en la Tierra?": "5",
      "¿Qué país tiene más habitantes?": "China",
      "¿Cuál es la montaña más alta del mundo?": "Monte Everest"
    },
    "arte": {
      "¿Cuál de las siguientes NO es una técnica de pintura tradicional?": "Fotolitografía digital",
      "El círculo cromático primario está compuesto por:": "Rojo, amarillo y azul",
      "¿Qué artista es conocido por su famosa obra 'La noche estrellada'?": "Vincent van Gogh",
      "La técnica del sfumato fue desarrollada y popularizada por:": "Leonardo da Vinci",
      "¿Qué es el surrealismo?": "Es un movimiento artístico que busca explorar el lado subconsciente de la mente humana, a través de imágenes oníricas"
    }
  };

  // Variable para almacenar el tema seleccionado
  selectedTheme: keyof typeof this.questions = "historia";
  
  // Variables para la pregunta actual y opciones
  currentQuestion: string = '';
  currentCorrectAnswer: string = '';
  options: string[] = [];
  message: string = '';
  answeredCorrectly: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.selectRandomTheme();
    this.nextQuestion();
  }

  // Selecciona aleatoriamente una temática y la guarda en selectedTheme
  selectRandomTheme(): void {
    const themes = Object.keys(this.questions);
    const randomIndex = Math.floor(Math.random() * themes.length);
    this.selectedTheme = themes[randomIndex] as keyof typeof this.questions;
  }

  // Selecciona una nueva pregunta aleatoriamente y genera las opciones de respuesta.
  nextQuestion(): void {
    this.message = '';
    this.answeredCorrectly = false;

    // Obtiene el diccionario de preguntas para el tema seleccionado.
    const themeQuestions = this.questions[this.selectedTheme];
    const questionKeys = Object.keys(themeQuestions);
    const randomIndex = Math.floor(Math.random() * questionKeys.length);
    this.currentQuestion = questionKeys[randomIndex];
    this.currentCorrectAnswer = themeQuestions[this.currentQuestion];

    // Genera opciones: la respuesta correcta + 3 respuestas incorrectas.
    const allAnswers = Object.values(themeQuestions).filter(ans => ans !== this.currentCorrectAnswer);
    let incorrectAnswers: string[] = [];

    while (incorrectAnswers.length < 3 && allAnswers.length > 0) {
      const index = Math.floor(Math.random() * allAnswers.length);
      const selected = allAnswers[index];
      if (!incorrectAnswers.includes(selected)) {
        incorrectAnswers.push(selected);
      }
    }

    // Combina y baraja las opciones.
    this.options = [this.currentCorrectAnswer, ...incorrectAnswers];
    this.shuffleArray(this.options);
  }

  // Algoritmo de Fisher-Yates para barajar un array.
  shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Método que se invoca cuando el usuario selecciona una respuesta.
  selectAnswer(answer: string): void {
    if (answer === this.currentCorrectAnswer) {
      this.message = "¡Correcto!";
      this.answeredCorrectly = true;
    } else {
      this.message = "Incorrecto. La respuesta correcta es: " + this.currentCorrectAnswer;
      this.answeredCorrectly = false;
    }
  }
}

