// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'displayWord'
// })
// export class DisplayWordPipe implements PipeTransform {

//   transform(value: unknown, ...args: unknown[]): unknown {
//     return null;
//   }

// }


// display-word.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayWord'
})
export class DisplayWordPipe implements PipeTransform {
  transform(word: string, guessedLetters: string[]): string {
    if (!word) {
      return '';
    }
    return word
      .split('')
      .map(letter => guessedLetters.includes(letter.toLowerCase()) ? letter : '_')
      .join(' ');
  }
}