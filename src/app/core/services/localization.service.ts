import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLocalizations(parentId: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/localizations/${parentId}`);
  }
}
