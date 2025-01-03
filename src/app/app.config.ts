import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
              provideRouter(routes),
              provideHttpClient(),
              provideFirebaseApp(() => initializeApp({
                "projectId":"tecnicayservicios-dbeb6","appId":"1:529078575650:web:f6fe59b6f622a22bf7e07b","storageBucket":"tecnicayservicios-dbeb6.firebasestorage.app","apiKey":"AIzaSyACpHYLuCKTcYONod9WrxjcPjfi1LslQSQ","authDomain":"tecnicayservicios-dbeb6.firebaseapp.com","messagingSenderId":"529078575650","measurementId":"G-L1JP9KC78X"
              })),
             provideAuth(() => getAuth()),
             provideFirestore(() => getFirestore())
            ]
};
