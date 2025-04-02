
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'enumerateWords'
})
export class EnumerateWordsPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    // Separa las palabras (considera múltiples espacios)
    const words = value.trim().split(/\s+/);
    // Mapea cada palabra con su número y dos saltos de línea (para dejar un espacio extra)
    const enumerated = words.map((word, index) => `${index + 1}. ${word}`).join('<br>');
    // Sanitiza el HTML para que Angular lo renderice correctamente
    return this.sanitizer.bypassSecurityTrustHtml(enumerated);
  }
}
