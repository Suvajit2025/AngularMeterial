import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { DepartmentLookupOption } from '../../core/models/department-lookup.model';
import { DesignationLookupOption } from '../../core/models/designation-lookup.model';
import { EmployeeLookupOption } from '../../core/models/employee-lookup.model';
import { PostLookupOption } from '../../core/models/post-lookup.model';
import { DepartmentMultiselectComponent } from '../../shared/components/department-multiselect/department-multiselect';
import { DepartmentSelectComponent } from '../../shared/components/department-select/department-select';
import { DesignationMultiselectComponent } from '../../shared/components/designation-multiselect/designation-multiselect';
import { DesignationSelectComponent } from '../../shared/components/designation-select/designation-select';
import { EmployeeSelectComponent } from '../../shared/components/employee-select/employee-select';
import { EmployeeVirtualMultiselectComponent } from '../../shared/components/employee-virtual-multiselect/employee-virtual-multiselect';
import { PostMultiselectComponent } from '../../shared/components/post-multiselect/post-multiselect';
import { PostSelectComponent } from '../../shared/components/post-select/post-select';

// DashboardMetric describes each KPI card on the dashboard.
interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

// WorkflowItem describes one row in the workflow table.
interface WorkflowItem {
  type: string;
  owner: string;
  status: string;
  due: string;
}

// DashboardComponent is lazy loaded from app.routes.ts.
// It demonstrates Signals for local page state and Material table/card-style UI.
@Component({
  selector: 'app-dashboard',
  imports: [
    DepartmentMultiselectComponent,
    DepartmentSelectComponent,
    DesignationMultiselectComponent,
    DesignationSelectComponent,
    EmployeeSelectComponent,
    EmployeeVirtualMultiselectComponent,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    PostMultiselectComponent,
    PostSelectComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  // Signal used for local UI state. These cards can later be loaded from an API.
  protected readonly metrics = signal<DashboardMetric[]>([
    { label: 'Active Employees', value: '1,284', trend: '+4.8% this month', icon: 'groups' },
    { label: 'Pending Approvals', value: '42', trend: '12 leave requests', icon: 'approval' },
    { label: 'Payroll Readiness', value: '96%', trend: 'May cycle on track', icon: 'payments' },
    { label: 'Open Positions', value: '18', trend: '7 interviews today', icon: 'person_search' },
  ]);

  // Signal used for local table state. RxJS would be used when this comes from HttpClient.
  protected readonly workflows = signal<WorkflowItem[]>([
    { type: 'Leave approval', owner: 'People Ops', status: 'In review', due: 'Today' },
    { type: 'Payroll exception', owner: 'Finance', status: 'Needs action', due: 'Today' },
    { type: 'New joiner setup', owner: 'IT Admin', status: 'Scheduled', due: 'Tomorrow' },
    { type: 'Recruitment panel', owner: 'Talent Team', status: 'Confirmed', due: 'May 26' },
  ]);

  // Angular Material table needs the list of columns to render.
  protected readonly displayedColumns = ['type', 'owner', 'status', 'due'];

  // Signal used to test the reusable normal employee select component.
  protected readonly selectedEmployee = signal<EmployeeLookupOption | null>(null);

  // Signal used to test the reusable virtual-scroll multiselect component.
  protected readonly selectedEmployees = signal<EmployeeLookupOption[]>([]);

  // Signal used to test the reusable PrimeNG department select component.
  protected readonly selectedDepartment = signal<DepartmentLookupOption | null>(null);

  // Signal used to test the reusable PrimeNG department multiselect component.
  protected readonly selectedDepartments = signal<DepartmentLookupOption[]>([]);

  // Signal used to test the reusable PrimeNG designation select component.
  protected readonly selectedDesignation = signal<DesignationLookupOption | null>(null);

  // Signal used to test the reusable PrimeNG designation multiselect component.
  protected readonly selectedDesignations = signal<DesignationLookupOption[]>([]);

  // Signal used to test the reusable PrimeNG post select component.
  protected readonly selectedPost = signal<PostLookupOption | null>(null);

  // Signal used to test the reusable PrimeNG post multiselect component.
  protected readonly selectedPosts = signal<PostLookupOption[]>([]);

  // Computed signal derives a value from workflows without storing duplicate state.
  protected readonly completedWorkflows = computed(
    () => this.workflows().filter((workflow) => workflow.status !== 'Needs action').length,
  );

  protected readonly selectedEmployeesPreview = computed(() =>
    this.selectedEmployees()
      .slice(0, 3)
      .map((employee) => employee.label)
      .join(', '),
  );

  protected readonly selectedDepartmentsPreview = computed(() =>
    this.selectedDepartments()
      .slice(0, 3)
      .map((department) => department.name)
      .join(', '),
  );

  protected readonly selectedDesignationsPreview = computed(() =>
    this.selectedDesignations()
      .slice(0, 3)
      .map((designation) => designation.name)
      .join(', '),
  );

  protected readonly selectedPostsPreview = computed(() =>
    this.selectedPosts()
      .slice(0, 3)
      .map((post) => post.name)
      .join(', '),
  );

  protected onEmployeeSelected(employee: EmployeeLookupOption | null): void {
    this.selectedEmployee.set(employee);
  }

  protected onEmployeesSelected(employees: EmployeeLookupOption[]): void {
    this.selectedEmployees.set(employees);
  }

  protected onDepartmentSelected(department: DepartmentLookupOption | null): void {
    this.selectedDepartment.set(department);
  }

  protected onDepartmentsSelected(departments: DepartmentLookupOption[]): void {
    this.selectedDepartments.set(departments);
  }

  protected onDesignationSelected(designation: DesignationLookupOption | null): void {
    this.selectedDesignation.set(designation);
  }

  protected onDesignationsSelected(designations: DesignationLookupOption[]): void {
    this.selectedDesignations.set(designations);
  }

  protected onPostSelected(post: PostLookupOption | null): void {
    this.selectedPost.set(post);
  }

  protected onPostsSelected(posts: PostLookupOption[]): void {
    this.selectedPosts.set(posts);
  }
}
