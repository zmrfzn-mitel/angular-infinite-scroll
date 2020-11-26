import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Fact } from '../_model/fact.model';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FactService {

  constructor(private http: HttpClient) { }

  getRandomFact(start?: number, end?: number): Observable<Fact[]> {
    const month = Math.floor(Math.random() * 11) + 1;
    let maxDay = 30;
    if (month === 2) {
      maxDay = 27;
    } else if ([4, 6, 9, 11].includes(month)) {
      maxDay = 29;
    }
    const day = Math.floor(Math.random() * maxDay) + 1;

    let requestObj =[];
    for(let i = start; i<=end; i++) {
        requestObj.push(
          this.http.get<Fact[]>(`http://numbersapi.com/${month}/${i}/date?json`)
        );
    }
    return forkJoin(requestObj);
  }
}
