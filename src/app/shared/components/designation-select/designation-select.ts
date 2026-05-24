import { Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { DesignationLookupOption } from '../../../core/models/designation-lookup.model';
import { DesignationLookupService } from '../../../core/services/designation-lookup.service';

@Component({
  selector: 'app-designation-select',
  imports: [FormsModule, SelectModule],
  templateUrl: './designation-select.html',
  styleUrl: './designation-select.scss',
})
export class DesignationSelectComponent {
  private readonly designationLookupService = inject(DesignationLookupService);

  // Output emits the selected designation object to the parent form/page.
  readonly designationSelected = output<DesignationLookupOption | null>();

  // Signal stores selected designation object for PrimeNG binding.
  protected readonly selectedDesignation = signal<DesignationLookupOption | null>(null);

  // Convert API Observable into a Signal for clean template binding.
  protected readonly designations = toSignal(this.designationLookupService.getDesignations(), {
    initialValue: [] as DesignationLookupOption[],
  });

  protected selectDesignation(designation: DesignationLookupOption | null): void {
    this.selectedDesignation.set(designation);
    this.designationSelected.emit(designation);
  }
}
