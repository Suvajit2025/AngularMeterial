import { Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { DepartmentLookupOption } from '../../../core/models/department-lookup.model';
import { DepartmentLookupService } from '../../../core/services/department-lookup.service';

@Component({
  selector: 'app-department-select',
  standalone: true,
  imports: [FormsModule, SelectModule],
  templateUrl: './department-select.html',
  styleUrl: './department-select.scss',
})
export class DepartmentSelectComponent {
  private readonly departmentLookupService = inject(DepartmentLookupService);

  // Output emits the selected department object to the parent form/page.
  readonly departmentSelected = output<DepartmentLookupOption | null>();

  // Signal stores the selected department object for PrimeNG two-way style binding.
  protected readonly selectedDepartment = signal<DepartmentLookupOption | null>(null);

  // Convert API Observable into a Signal for simple Angular template binding.
  protected readonly departments = toSignal(this.departmentLookupService.getDepartments(), {
    initialValue: [] as DepartmentLookupOption[],
  });

  protected selectDepartment(department: DepartmentLookupOption | null): void {
    this.selectedDepartment.set(department);
    this.departmentSelected.emit(department);
  }
}
