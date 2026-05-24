import { Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

import { DesignationLookupOption } from '../../../core/models/designation-lookup.model';
import { DesignationLookupService } from '../../../core/services/designation-lookup.service';

@Component({
  selector: 'app-designation-multiselect',
  imports: [FormsModule, MultiSelectModule],
  templateUrl: './designation-multiselect.html',
  styleUrl: './designation-multiselect.scss',
})
export class DesignationMultiselectComponent {
  private readonly designationLookupService = inject(DesignationLookupService);

  // Output emits all selected designations to the parent form/page.
  readonly selectionChanged = output<DesignationLookupOption[]>();

  // Signal stores selected designations. PrimeNG handles search, overlay, checkbox, and virtual scroll.
  protected readonly selectedDesignations = signal<DesignationLookupOption[]>([]);

  protected readonly designations = toSignal(this.designationLookupService.getDesignations(), {
    initialValue: [] as DesignationLookupOption[],
  });

  protected selectDesignations(designations: DesignationLookupOption[] | null): void {
    const selected = designations ?? [];
    this.selectedDesignations.set(selected);
    this.selectionChanged.emit(selected);
  }
}
