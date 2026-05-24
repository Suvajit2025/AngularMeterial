import { Component } from '@angular/core';

// FooterComponent displays small product/version information at the bottom of the shell.
@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();
}
