
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimations(),
  ],
}).catch(err => console.error(err));


// // src/main.ts
// import { bootstrapApplication }                  from '@angular/platform-browser';
// import { provideRouter }                         from '@angular/router';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// import { provideAnimations }                     from '@angular/platform-browser/animations';

// // Firebase
// import { provideFirebaseApp, initializeApp }      from '@angular/fire/app';
// import { provideFirestore, getFirestore }         from '@angular/fire/firestore';
// import { provideAuth }                            from '@angular/fire/auth';
// import { getAuth }                                from 'firebase/auth';

// import { AppComponent } from './app/app.component';
// import { routes }       from './app/app.routes';
// import { environment }  from './environments/environment';

// bootstrapApplication(AppComponent, {
//   providers: [
//     // HTTP con interceptores desde DI
//     provideHttpClient(withInterceptorsFromDi()),

//     // Routing
//     provideRouter(routes),

//     // Animaciones (Angular Material)
//     provideAnimations(),

//     // Inicializa el App de Firebase con tus credenciales
//     provideFirebaseApp(() => initializeApp(environment.firebase)),

//     // Firestore
//     provideFirestore(() => getFirestore()),

//     // **Auth**: aquí añades el provider de autenticación
//     provideAuth(() => getAuth()),
//   ]
// });





// // src/main.ts
// import { bootstrapApplication }         from '@angular/platform-browser';
// import { provideRouter }                from '@angular/router';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// import { provideAnimations }            from '@angular/platform-browser/animations';
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideFirestore, getFirestore }    from '@angular/fire/firestore';

// import { AppComponent } from './app/app.component';
// import { routes }       from './app/app.routes';
// import { environment }  from './environments/environment';

// bootstrapApplication(AppComponent, {
//   providers: [
//     // Cliente HTTP con interceptores desde DI
//     provideHttpClient(withInterceptorsFromDi()),

//     // Enrutador de la aplicación
//     provideRouter(routes),

//     // Inicializar Firebase App
//     provideFirebaseApp(() => initializeApp(environment.firebase)),

//     // Proveer Firestore
//     provideFirestore(() => getFirestore()),

//     // Habilitar animaciones (necesario si usas Angular Material)
//     provideAnimations()
//   ]
// });







