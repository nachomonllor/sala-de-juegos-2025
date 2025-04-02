import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverse'
})
export class ReversePipe implements PipeTransform {

  transform( v:string):string {
    if(!v) return '';
     return v.split('').reverse().join('');
  }

}
