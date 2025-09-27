import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeFabComponent } from './home-fab.component';

describe('HomeFabComponent', () => {
  let component: HomeFabComponent;
  let fixture: ComponentFixture<HomeFabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
