import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// bootstrapApplication starts a standalone Angular app without using NgModules.
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
