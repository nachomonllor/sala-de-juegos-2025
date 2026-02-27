import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NatureParkComponent } from './nature-park.component';

describe('NatureParkComponent', () => {
  let component: NatureParkComponent;
  let fixture: ComponentFixture<NatureParkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NatureParkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NatureParkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
