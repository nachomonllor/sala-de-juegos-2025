import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'letterOnly'
})


export class LetterOnlyPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }
    // Elimina todos los caracteres que no sean letras (mayúsculas o minúsculas)
    const filtered = value.replace(/[^a-zA-Z]/g, '');
    // Retorna solo la primera letra válida (si existe)
    return filtered ? filtered.charAt(0) : '';
  }
}