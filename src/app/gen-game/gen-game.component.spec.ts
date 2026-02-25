import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenGameComponent } from './gen-game.component';

describe('GenGameComponent', () => {
  let component: GenGameComponent;
  let fixture: ComponentFixture<GenGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
