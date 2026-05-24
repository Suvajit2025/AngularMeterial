import { Component, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { EmployeeLookupOption } from '../../../core/models/employee-lookup.model';
import { EmployeeLookupService } from '../../../core/services/employee-lookup.service';

@Component({
  selector: 'app-employee-select',
  imports: [FormsModule, SelectModule],
  templateUrl: './employee-select.html',
  styleUrl: './employee-select.scss',
})
export class EmployeeSelectComponent {
  private readonly employeeLookupService = inject(EmployeeLookupService);

  // Output emits the selected employee object to the parent page.
  readonly employeeSelected = output<EmployeeLookupOption | null>();

  // Signal used for the selected employee object.
  // PrimeNG select can bind directly to the full object, which is useful for enterprise forms.
  protected readonly selectedEmployee = signal<EmployeeLookupOption | null>(null);

  // Convert API Observable into Signal so template filtering is simple.
  protected readonly employees = toSignal(this.employeeLookupService.getEmployees(), {
    initialValue: [] as EmployeeLookupOption[],
  });

  protected selectEmployee(employee: EmployeeLookupOption | null): void {
    this.selectedEmployee.set(employee);
    this.employeeSelected.emit(employee);
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
