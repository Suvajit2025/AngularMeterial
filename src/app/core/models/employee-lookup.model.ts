// API model for the centralized employee list endpoint.
// The field names match the backend response so beginners can compare API JSON and TypeScript easily.
export interface EmployeeLookupApi {
  EmpID: number;
  empno: number;
  Employee: string;
  FileLocation: string | null;
  empemail: string | null;
}

// UI model used by reusable employee picker components.
// Keeping API and UI models separate makes components easier to reuse.
export interface EmployeeLookupOption {
  empId: number;
  empNo: number;
  label: string;
  email: string;
  imageUrl: string;
  initials: string;
}
