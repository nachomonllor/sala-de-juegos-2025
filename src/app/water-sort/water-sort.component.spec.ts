import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterSortComponent } from './water-sort.component';

describe('WaterSortComponent', () => {
  let component: WaterSortComponent;
  let fixture: ComponentFixture<WaterSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterSortComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WaterSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
