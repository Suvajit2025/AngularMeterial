import { Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

import { DepartmentLookupOption } from '../../../core/models/department-lookup.model';
import { DepartmentLookupService } from '../../../core/services/department-lookup.service';

@Component({
  selector: 'app-department-multiselect',
  imports: [FormsModule, MultiSelectModule],
  templateUrl: './department-multiselect.html',
  styleUrl: './department-multiselect.scss',
})
export class DepartmentMultiselectComponent {
  private readonly departmentLookupService = inject(DepartmentLookupService);

  // Output emits all selected departments to the parent form/page.
  readonly selectionChanged = output<DepartmentLookupOption[]>();

  // Signal stores selected departments. PrimeNG handles checkboxes, overlay, search, and virtual scroll.
  protected readonly selectedDepartments = signal<DepartmentLookupOption[]>([]);

  protected readonly departments = toSignal(this.departmentLookupService.getDepartments(), {
    initialValue: [] as DepartmentLookupOption[],
  });

  protected selectDepartments(departments: DepartmentLookupOption[] | null): void {
    const selected = departments ?? [];
    this.selectedDepartments.set(selected);
    this.selectionChanged.emit(selected);
  }
}
