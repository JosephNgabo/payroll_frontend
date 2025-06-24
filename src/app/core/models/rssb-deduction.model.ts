export interface RssbDeduction {
  id: string;
  rssb_name: string;
  rssb_description: string;
  rssb_deduction_code: number;
  rssb_employer_contribution: string;
  rssb_employee_contribution: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PaginatedRssbDeductions {
  current_page: number;
  data: RssbDeduction[];
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