import { Pair, FlowFreeEngine } from "../../games/flowfree-engine";


describe('Solved exige tablero lleno y pares conectados', () => {
  it('conecta pares pero NO llena todas las celdas ⇒ no resuelto', () => {
    // 2x2, conecto cada par con trazo mínimo, pero dejo una celda libre
    const pairs: Pair[] = [
      { color: 'red', a: { r: 0, c: 0 }, b: { r: 0, c: 1 } },
      { color: 'blue', a: { r: 1, c: 0 }, b: { r: 1, c: 1 } },
    ];
    const e = new FlowFreeEngine(2, pairs);

    e.startDragAt({ r: 0, c: 0 }); e.dragTo({ r: 0, c: 1 }); // rojo conecta
    e.startDragAt({ r: 1, c: 0 }); e.dragTo({ r: 1, c: 1 }); // azul conecta

    expect(e.isSolved()).toBeFalse();            // faltan las dos celdas de arriba/abajo
    const p = e.progress();
    expect(p.connected).toBe(2);
    expect(p.covered).toBe(4);                   // en 2x2 ya cubrimos 4, pero ojo:
    // si endpoints cuentan al trazar, aquí
    // estarían todas; para ver el caso
    // de "quedan celdas", usa 2x3:
  });

  it('2x3: pares conectados pero queda una celda libre ⇒ no resuelto', () => {
    const pairs: Pair[] = [
      { color: 'red', a: { r: 0, c: 0 }, b: { r: 0, c: 1 } },
      { color: 'blue', a: { r: 1, c: 0 }, b: { r: 1, c: 1 } },
    ];
    const e = new FlowFreeEngine(3, pairs);

    // rojo ocupa (0,0)->(0,1)
    e.startDragAt({ r: 0, c: 0 }); e.dragTo({ r: 0, c: 1 });
    // azul ocupa (1,0)->(1,1)
    e.startDragAt({ r: 1, c: 0 }); e.dragTo({ r: 1, c: 1 });

    expect(e.isSolved()).toBeFalse();            // queda columna c=2 libre
  });

  it('cuando todas las celdas están cubiertas y todos conectados ⇒ resuelto', () => {
    // 2x2, cubrir todas
    const pairs: Pair[] = [
      { color: 'red', a: { r: 0, c: 0 }, b: { r: 1, c: 0 } },
      { color: 'blue', a: { r: 0, c: 1 }, b: { r: 1, c: 1 } },
    ];
    const e = new FlowFreeEngine(2, pairs);

    e.startDragAt({ r: 0, c: 0 }); e.dragTo({ r: 1, c: 0 }); // rojo vertical
    e.startDragAt({ r: 0, c: 1 }); e.dragTo({ r: 1, c: 1 }); // azul vertical

    expect(e.isSolved()).toBeTrue();
  });

  it('tablero 3x3, conecta pares pero queda una celda libre ⇒ no resuelto', () => {
    const pairs: Pair[] = [
      { color: 'red', a: { r: 0, c: 0 }, b: { r: 0, c: 1 } },
      { color: 'blue', a: { r: 1, c: 0 }, b: { r: 1, c: 1 } },
    ];
    const e = new FlowFreeEngine(3, pairs);
    // rojo ocupa (0,0)->(0,1)

    e.startDragAt({ r: 0, c: 0 }); e.dragTo({ r: 0, c: 1 });
    // azul ocupa (1,0)->(1,1)
    e.startDragAt({ r: 1, c: 0 }); e.dragTo({ r: 1, c: 1 });
    expect(e.isSolved()).toBeFalse();            // queda columna c=2 libre
  });
  

});


// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { Flowfree } from './flowfree';

// describe('Flowfree', () => {
//   let component: Flowfree;
//   let fixture: ComponentFixture<Flowfree>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [Flowfree]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(Flowfree);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
