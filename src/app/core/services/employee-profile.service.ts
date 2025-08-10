import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EmployeeProfileResponse {
  status: boolean;
  message: string;
  data: {
    user: {
      id: string;
      id_util: number;
      firstname: string;
      lastname: string;
      username: string;
      phone: string;
      title: string;
      email: string;
      verified_at: string | null;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      is_active: boolean;
      login_attempts: number;
      avatar: string | null;
      language: string;
      user_profile: string;
    };
    employee: {
      id: string;
      salutation: string;
      first_name: string;
      last_name: string;
      gender: string;
      date_of_birth: string;
      nationality: {
        id: number;
        code_two: string;
        code_three: string;
        country: string;
        currency: string;
        currency_symbol: string;
        is_active: boolean;
        created_at: string | null;
        updated_at: string | null;
      };
      country_of_birth: number;
      marital_status: string;
      name_of_spouse: string;
      number_of_children: number;
      document_type: string;
      document_number: string;
      document_issue_date: string | null;
      document_expiry_date: string | null;
      document_place_of_issue: string;
      rssb_number: string;
      highest_education: string;
      personal_mobile: string;
      personal_email: string;
      home_phone: string;
      status: number;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      country: {
        id: number;
        code_two: string;
        code_three: string;
        country: string;
        currency: string;
        currency_symbol: string;
        is_active: boolean;
        created_at: string | null;
        updated_at: string | null;
      };
      employee_contracts: {
        id: string;
        department: string;
        job_title: string;
        employment_type: string;
        hire_date: string;
        end_date: string | null;
        salary_basis: string;
        salary_amount: string;
        salary_frequency: string;
        tin_number: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        employee_id: string;
      };
      employee_allowances: Array<{
        id: string;
        description: string | null;
        amount: string;
        type: string;
        allowance_id: string;
        employee_id: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        allowance: {
          id: string;
          allowance_code: number;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      }>;
      employee_other_deductions: Array<any>;
      employee_rssb_contribution: Array<{
        id: string;
        rssb_employer_contribution: string;
        rssb_employee_contribution: string;
        type: string;
        rssb_deduction_id: string;
        employee_id: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        rssb_deductions: {
          id: string;
          rssb_name: string;
          rssb_description: string;
          rssb_deduction_code: number;
          rssb_employer_contribution: string;
          rssb_employee_contribution: string;
          base_field: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      }>;
      employee_emergency_contacts: Array<any>;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeProfileService {
  private readonly API_URL = `${environment.apiUrl}/employee/profile`;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<EmployeeProfileResponse> {
    return this.http.get<EmployeeProfileResponse>(this.API_URL);
  }
}
