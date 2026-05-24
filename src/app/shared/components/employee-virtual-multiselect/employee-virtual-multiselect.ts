import { Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

import { EmployeeLookupOption } from '../../../core/models/employee-lookup.model';
import { EmployeeLookupService } from '../../../core/services/employee-lookup.service';

@Component({
  selector: 'app-employee-virtual-multiselect',
  imports: [FormsModule, MultiSelectModule],
  templateUrl: './employee-virtual-multiselect.html',
  styleUrl: './employee-virtual-multiselect.scss',
})
export class EmployeeVirtualMultiselectComponent {
  private readonly employeeLookupService = inject(EmployeeLookupService);

  // Output emits the complete selected employee list to a parent page.
  readonly selectionChanged = output<EmployeeLookupOption[]>();

  // Signal stores selected employee objects.
  // PrimeNG MultiSelect handles filtering, overlay, checkboxes, and virtual scrolling for us.
  protected readonly selectedEmployees = signal<EmployeeLookupOption[]>([]);

  protected readonly employees = toSignal(this.employeeLookupService.getEmployees(), {
    initialValue: [] as EmployeeLookupOption[],
  });

  protected selectEmployees(employees: EmployeeLookupOption[] | null): void {
    const selected = employees ?? [];
    this.selectedEmployees.set(selected);
    this.selectionChanged.emit(selected);
  }

  protected handleAvatarError(event: Event, employee: EmployeeLookupOption): void {
    const imageElement = event.target as HTMLImageElement;
    const fallbackImage = this.getAvatarUrl(employee.label);

    if (imageElement.src !== fallbackImage) {
      imageElement.src = fallbackImage;
    }
  }

  private getAvatarUrl(employeeName: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeName)}&background=2563eb&color=ffffff&bold=true`;
  }
}
