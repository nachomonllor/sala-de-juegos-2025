

// src/main.ts
import { bootstrapApplication }         from '@angular/platform-browser';
import { provideRouter }                from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations }            from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore }    from '@angular/fire/firestore';

import { AppComponent } from './app/app.component';
import { routes }       from './app/app.routes';
import { environment }  from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    // Cliente HTTP con interceptores desde DI
    provideHttpClient(withInterceptorsFromDi()),

    // Enrutador de la aplicación
    provideRouter(routes),

    // Inicializar Firebase App
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // Proveer Firestore
    provideFirestore(() => getFirestore()),

    // Habilitar animaciones (necesario si usas Angular Material)
    provideAnimations()
  ]
});



// // main.ts
// import { bootstrapApplication }      from '@angular/platform-browser';
// import { provideAnimations }        from '@angular/platform-browser/animations';
// import { AppComponent } from './app/app.component';
// import { provideRouter }            from '@angular/router';
// import { routes } from './app/app.routes';
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideFirestore, getFirestore    } from '@angular/fire/firestore';
// import { environment }              from './environments/environment';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideRouter(routes),
//     provideFirebaseApp(() => initializeApp(environment.firebase)),
//     provideFirestore(() => getFirestore()),
//     provideAnimations()            // ← esto habilita BrowserAnimationsModule
//   ]
// });



// // main.ts
// import { bootstrapApplication }      from '@angular/platform-browser';
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideFirestore, getFirestore }    from '@angular/fire/firestore';
// import { provideRouter }            from '@angular/router';
// import { provideAnimations }        from '@angular/platform-browser/animations';
// import { AppComponent } from './app/app.component';
// import { routes } from './app/app.routes';
// import { environment } from './environments/environment';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideFirebaseApp(() => initializeApp(environment.firebase)),
//     provideFirestore(() => getFirestore()),    // ← esto es esencial
//     provideRouter(routes),
//     provideAnimations()
//   ]
// });




// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// import { routes } from './app/app.routes';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideHttpClient(withInterceptorsFromDi()),
//     provideRouter(routes)
//   ]
// });


// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, appConfig)
// .catch((err) => console.error(err));



// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideHttpClient } from '@angular/common/http';
// import { provideRouter } from '@angular/router';
// import { routes } from './app/app.routes';
// import { HomeComponent } from './app/home/home.component';

// bootstrapApplication(HomeComponent, {
//   providers: [provideHttpClient(), provideRouter(routes)]
// });





// // main.ts
// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideRouter } from '@angular/router';
// import { routes } from './app/app.routes';
// import { AppComponent } from './app/app.component';

// bootstrapApplication(AppComponent, {
//   providers: [provideRouter(routes)]
// });


// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideRouter } from '@angular/router';
// import { routes } from './app/app.routes';
// import { PantallaJuegosComponent } from './app/pantalla-juegos/pantalla-juegos.component';

// bootstrapApplication(PantallaJuegosComponent, {
//   providers: [provideRouter(routes)]
// }).catch(err => console.error(err));


// import { bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app/app.component';
// import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideHttpClient(withInterceptorsFromDi())
//   ]
// }).catch(err => console.error(err));


//   // main.ts
// import { bootstrapApplication } from '@angular/platform-browser';
// import { importProvidersFrom } from '@angular/core';
// import { AppComponent } from './app/app.component';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { HttpClientModule } from '@angular/common/http';

// bootstrapApplication(AppComponent, {
//   providers: [
//     importProvidersFrom(HttpClientModule,
//      // AngularFireModule.initializeApp(environment.firebase),
//     //  AngularFirestoreModule
//     ), provideAnimationsAsync()
//   ]
// }).catch(err => console.error(err));


// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideRouter } from '@angular/router';
// import { PantallaJuegosComponent } from './app/pantalla-juegos/pantalla-juegos.component';
// import { routes } from './app/app.routes';


// bootstrapApplication(PantallaJuegosComponent, {
//   providers: [provideRouter(routes)]
// });


//import { bootstrapApplication } from '@angular/platform-browser';
// import { provideRouter } from '@angular/router';
// import { routes } from './app/app.routes';
// import { PantallaJuegosComponent } from './app/pantalla-juegos/pantalla-juegos.component';

// bootstrapApplication(PantallaJuegosComponent, {
//   providers: [provideRouter(routes)]
// });
