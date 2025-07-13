export interface EmployeeAddress {
  type: string;
  country: number | string;
  province: number | string;
  district: number | string;
  sector: number | string;
  cell: number | string;
  village: number | string;
  city?: string;
  additional_address?: string;
  postal_code?: string;
  street_address?: string;
} 