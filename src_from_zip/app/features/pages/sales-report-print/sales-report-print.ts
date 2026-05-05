import { Component } from '@angular/core';

@Component({
  selector: 'app-sales-report-print',
  imports: [],
  templateUrl: './sales-report-print.html',
  styleUrl: './sales-report-print.css',
})
export class SalesReportPrint {
printReport() {
  window.print();
}

}
