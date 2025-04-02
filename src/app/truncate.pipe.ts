import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'truncate'
})

export class TruncatePipe implements PipeTransform {
  
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, limit: number = 10): SafeHtml {
    if (value.length > limit) {
      value = value.substring(0, limit) + "...";
    }
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
  
}



