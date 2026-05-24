import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Root standalone component for the Angular application.
// It only hosts the router outlet because the shell layout is loaded by routing.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
