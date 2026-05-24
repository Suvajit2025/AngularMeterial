// API model for the centralized department list endpoint.
// Only IDDepartment and Name are needed for dropdowns.
export interface DepartmentLookupApi {
  IDDepartment: number;
  Name: string;
  OldDeptId?: number;
}

// UI option model used by reusable PrimeNG department picker components.
export interface DepartmentLookupOption {
  departmentId: number;
  name: string;
}
