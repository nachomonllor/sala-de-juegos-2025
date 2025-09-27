import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponentInicial } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponentInicial;
  let fixture: ComponentFixture<HomeComponentInicial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponentInicial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponentInicial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
