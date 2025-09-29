import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuienSoyFabComponent } from './quien-soy-fab.component';

describe('QuienSoyFabComponent', () => {
  let component: QuienSoyFabComponent;
  let fixture: ComponentFixture<QuienSoyFabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuienSoyFabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuienSoyFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
