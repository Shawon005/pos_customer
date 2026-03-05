import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReportPrint } from './sales-report-print';

describe('SalesReportPrint', () => {
  let component: SalesReportPrint;
  let fixture: ComponentFixture<SalesReportPrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesReportPrint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesReportPrint);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
