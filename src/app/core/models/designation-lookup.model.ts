// API model for the SOPDesignation endpoint.
// The backend endpoint name is SOPDesignation, but the business meaning is Designation.
export interface DesignationLookupApi {
  IDDesignation: number;
  Name: string;
}

// UI option model used by reusable PrimeNG designation picker components.
export interface DesignationLookupOption {
  designationId: number;
  name: string;
}
