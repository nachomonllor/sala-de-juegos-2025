import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PantallaJuegosComponent } from './pantalla-juegos.component';

describe('PantallaJuegosComponent', () => {
  let component: PantallaJuegosComponent;
  let fixture: ComponentFixture<PantallaJuegosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PantallaJuegosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantallaJuegosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
