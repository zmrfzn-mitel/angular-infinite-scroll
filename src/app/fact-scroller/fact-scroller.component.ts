import { Component } from '@angular/core';
import { Fact } from '../_model/fact.model';
import { FactService } from '../_service/fact.service';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-fact-scroller',
  templateUrl: './fact-scroller.component.html',
  styleUrls: ['./fact-scroller.component.scss']
})
export class FactScrollerComponent {

  dataSource: FactsDataSource;

  constructor(private factService: FactService) {
    this.dataSource = new FactsDataSource(factService);
  }

}

export class FactsDataSource extends DataSource<Fact | undefined> {
  private cachedFacts = Array.from<Fact>({ length: 0 });
  private dataStream = new BehaviorSubject<(Fact | undefined)[]>(this.cachedFacts);
  private subscription = new Subscription();

  loading = false;
  private pageSize = 10;
  private lastPage = 0;
  private pageStart = 1;
  private pageEnd = this.pageStart + this.pageSize;
  private totalItemsCount = 50;

  private startIndex = 1;
  // ($startIndex - 1) / $itemsPerPage) + 1;

  constructor(private factService: FactService) {
    super();

    // Start with some data.
    this._fetchFactPage(this.pageStart,this.pageEnd);
  }

  connect(collectionViewer: CollectionViewer): Observable<(Fact | undefined)[] | ReadonlyArray<Fact | undefined>> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {



      // console.log('range', range);
      const currentPage = this._getPageForIndex(range.end);

      const totalItemsCount = 50;

      this.getPaginationText(totalItemsCount, this.pageSize, currentPage);

      if (currentPage && range) {
        console.log('page:', currentPage, this.lastPage);
      }

      if (currentPage > this.lastPage) {
        this.loading = true;


        this.getPaginationText(this.totalItemsCount, this.pageSize, currentPage);
        this.lastPage = currentPage;
        if (this.pageEnd <= this.totalItemsCount) {
          this._fetchFactPage(this.pageStart, this.pageEnd);
          const event = { first: this.pageStart, rows: this.pageSize }
          // call here
          // this.myCustomFunc(event);
        }
      }
    }));
    return this.dataStream;
  }

  getPaginationText(totalItemsCount, numberOfItemsPerPage, page) {
    var pagesCount = (totalItemsCount - 1) / numberOfItemsPerPage + 1;
    var start = (page - 1) * numberOfItemsPerPage + 1;
    var end = Math.min(start + numberOfItemsPerPage - 1, totalItemsCount);

    console.log('page:', `${start} to ${end} of ${totalItemsCount}`);
    return `${start} to ${end} of ${totalItemsCount}`;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.subscription.unsubscribe();
  }

  private _fetchFactPage(start?, end?): void {
    // for (let i = 0; i < this.pageSize; ++i) {
    this.factService.getRandomFact(start, end).subscribe(res => {
      this.cachedFacts = this.cachedFacts.concat(res);
      this.dataStream.next(this.cachedFacts);
    });
    // }
    this.loading = false;
  }

  private _getPageForIndex(i: number): number {
    return Math.floor(i / this.pageSize);
  }

}
