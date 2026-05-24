// Employee is shaped like a future ASP.NET Core Web API response.
// Keeping the API field names here makes it easy to map real backend data later.
export type EmployeeNumber = string | number;

export interface Employee {
  EmpNo: EmployeeNumber;
  EmployeeName: string;
  DesignationName: string;
  ManagerNo: EmployeeNumber | null;
  ManagerName: string | null;
  FileLocation?: string | null;
  ImageUrl?: string | null;
  managerfilelocation?: string | null;
}

// This is the clean UI data we place inside PrimeNG TreeNode.data.
// Enterprise apps often keep API models and UI models separate for clarity.
export interface OrganizationNodeData {
  empNo: string;
  name: string;
  designation: string;
  managerNo: string | null;
  managerName: string | null;
  managerImage: string | null;
  initials: string;
  image: string;
  tooltip: OrganizationEmployeeTooltip;
}

// Typed tooltip model used by the org chart node hover state.
// Keeping this as a model makes it easy to replace Material tooltip with a richer modal/popover later.
export interface OrganizationEmployeeTooltip {
  text: string;
}

// OrganizationTreeNode is the recursive UI tree used by the horizontal chart renderer.
// Each node owns its children, which makes expand/collapse and recursive templates simple.
export interface OrganizationTreeNode {
  key: string;
  expanded: boolean;
  data: OrganizationNodeData;
  children: OrganizationTreeNode[];
}
