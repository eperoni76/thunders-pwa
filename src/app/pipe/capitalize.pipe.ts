import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Converte tutta la stringa in minuscolo e poi mette la prima lettera maiuscola
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

}
