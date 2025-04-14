import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowFreeComponent } from './flow-free.component';

describe('FlowFreeComponent', () => {
  let component: FlowFreeComponent;
  let fixture: ComponentFixture<FlowFreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowFreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowFreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
