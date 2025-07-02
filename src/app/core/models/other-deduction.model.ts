export interface OtherDeduction {
  id: string;
  deduction_name: string;
  deduction_description: string;
  deduction_code: number;
  has_tax: number;
  tax_rate: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface PaginatedOtherDeductions {
  current_page: number;
  data: OtherDeduction[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
} 