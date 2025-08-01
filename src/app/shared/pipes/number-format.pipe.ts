import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat'
})
export class NumberFormatPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return value.toString();
    }

    // Convert to string and remove trailing zeros
    const strValue = numValue.toString();
    
    // If it's a whole number, return as is
    if (Number.isInteger(numValue)) {
      return strValue;
    }

    // Remove trailing zeros after decimal point
    return strValue.replace(/\.?0+$/, '');
  }
} 