export interface EmployeeInformation {
  id?: string;
  salutation: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  country_of_birth: string;
  marital_status: string;
  name_of_spouse?: string | null;
  number_of_children: number;
  document_type: string;
  document_number: string;
  document_issue_date: string;
  document_place_of_issue: string;
  rssb_number: string;
  highest_education: string;
  personal_mobile: string;
  personal_email: string;
  created_at?: string;
} 