import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'titleCase'
})
export class TitleCasePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(s:string): SafeHtml {

    const a = s.split(' ');
    
    var res = '';

    for(var item of a) {
       
        res += item.charAt(0).toUpperCase().toString();
        res += item.substring(1).toString();
        res += ' ';
    }

    //return res;
    return this.sanitizer.bypassSecurityTrustHtml(res);
  }
}

