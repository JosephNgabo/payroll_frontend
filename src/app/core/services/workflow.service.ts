import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LaravelAuthService } from './laravel-auth.service';
import { map } from 'rxjs/operators';

export interface WorkflowConfiguration {
  id: string;
  name: string;
  code: string;
  description: string;
  active: boolean;
  entity_type: string;
  settings: {
    notifications: {
      email: boolean;
      sms: boolean;
      in_app: boolean;
    };
    escalation: {
      enabled: boolean;
      escalation_hours: number;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface PaginatedWorkflowResponse {
  current_page: number;
  data: WorkflowConfiguration[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface CreateWorkflowPayload {
  name: string;
  code: string;
  description: string;
  active: boolean;
  entity_type: string;
  settings: {
    notifications: {
      email: boolean;
      sms: boolean;
      in_app: boolean;
    };
    escalation: {
      enabled: boolean;
      escalation_hours: number;
    };
  };
}

export interface UpdateWorkflowPayload extends Partial<CreateWorkflowPayload> {}

export interface WorkflowApprovalResponse {
  current_page: number;
  data: any[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authService: LaravelAuthService
  ) {}

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {

    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get all workflow configurations with pagination
   */
  getWorkflowConfigurations(page: number = 1): Observable<PaginatedWorkflowResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<PaginatedWorkflowResponse>(`${this.API_URL}/workflow-configurations?page=${page}`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get a specific workflow configuration by ID
   */
  getWorkflowConfiguration(id: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/workflow-configurations/${id}`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Create a new workflow configuration
   */
  createWorkflowConfiguration(payload: CreateWorkflowPayload): Observable<WorkflowConfiguration> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<WorkflowConfiguration>(`${this.API_URL}/workflow-configurations`, payload, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Update an existing workflow configuration
   */
  updateWorkflowConfiguration(id: string, payload: UpdateWorkflowPayload): Observable<WorkflowConfiguration> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<WorkflowConfiguration>(`${this.API_URL}/workflow-configurations/${id}`, payload, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Delete a workflow configuration
   */
  deleteWorkflowConfiguration(id: string): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<void>(`${this.API_URL}/workflow-configurations/${id}`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get workflow action configurations for a specific workflow
   */
  getWorkflowActionConfigurations(workflowId: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/workflow-action-configurations/configuration/${workflowId}`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Toggle workflow status (activate/deactivate)
   */
  toggleWorkflowStatus(workflowId: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(`${this.API_URL}/workflow-configurations/${workflowId}/toggle-active`, {}, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Create workflow action configuration
   */
  createWorkflowAction(actionData: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(`${this.API_URL}/workflow-action-configurations`, actionData, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Update workflow action configuration
   */
  updateWorkflowAction(actionId: string, actionData: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<any>(`${this.API_URL}/workflow-action-configurations/${actionId}`, actionData, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Delete workflow action configuration
   */
  deleteWorkflowAction(actionId: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<any>(`${this.API_URL}/workflow-action-configurations/${actionId}`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get all users
   */
  getUsers(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/user`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get all groups
   */
  getGroups(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/groups`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get pending approvals for the current user
   */
  getPendingApprovals(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/workflow-processes/my/pending-approvals`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Approve a workflow process
   */
  approveWorkflow(workflowId: string, payload?: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    const approvalPayload = payload || { approved: true };
    return this.http.post<any>(`${this.API_URL}/workflow-processes/${workflowId}/actions/approve`, approvalPayload, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Reject a workflow process
   */
  rejectWorkflow(workflowId: string, payload?: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    const rejectionPayload = payload || { approved: false };
    return this.http.post<any>(`${this.API_URL}/workflow-processes/${workflowId}/actions/reject`, rejectionPayload, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  /**
   * Get pending payroll approvals count
   */
  getPendingPayrollApprovalsCount(): Observable<number> {
    return this.getPendingPayrollApprovals().pipe(
      map(response => {
        // Handle the correct API response structure
        if (response && response.message && Array.isArray(response.message)) {
          return response.message.length;
        } else if (Array.isArray(response)) {
          return response.length;
        } else if (response && typeof response === 'object' && response.data) {
          return Array.isArray(response.data) ? response.data.length : 0;
        }
        return 0;
      })
    );
  }

  /**
   * Get pending payroll approvals specifically
   */
  getPendingPayrollApprovals(): Observable<any> {
    return this.getPendingApprovals().pipe(
      map(response => {
        console.log('✅ Raw pending approvals response:', response);
        
        // Handle the correct API response structure
        let dataArray: any[] = [];
        
        if (response && response.message && Array.isArray(response.message)) {
          // Data is in the 'message' field
          dataArray = response.message;
        } else if (Array.isArray(response)) {
          dataArray = response;
        } else if (response && typeof response === 'object' && response.data) {
          dataArray = Array.isArray(response.data) ? response.data : [];
        }
        
        // Filter for payroll-related workflows
        const payrollApprovals = dataArray.filter((approval: any) => {
          console.log('🔍 Checking approval:', approval);
          
          // Check if it's a payroll workflow based on the actual structure
          const isPayrollWorkflow = 
            (approval.workflow_configuration && 
             (approval.workflow_configuration.code === 'PAYROLL_APPROVAL' || 
              approval.workflow_configuration.entity_type === 'payroll')) ||
            (approval.payroll && approval.payroll.id);
          
          console.log('🔍 Is payroll workflow:', isPayrollWorkflow);
          return isPayrollWorkflow;
        });
        
        console.log('✅ Filtered payroll approvals:', payrollApprovals);
        
        return {
          ...response,
          data: payrollApprovals
        };
      })
    );
  }

  /**
   * Debug method to test API response structure
   */
  debugPendingApprovals(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.API_URL}/workflow-processes/my/pending-approvals`, { headers })
      .pipe(
        map(response => {
          console.log('🔍 Debug - Raw API response:', response);
          console.log('🔍 Debug - Response type:', typeof response);
          console.log('🔍 Debug - Response keys:', Object.keys(response || {}));
          console.log('🔍 Debug - Response.data type:', typeof response?.data);
          console.log('🔍 Debug - Response.data is array:', Array.isArray(response?.data));
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Debug method to test approval API
   */
  debugApprovalAPI(workflowId: string, payload?: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    const approvalPayload = payload || { approved: true };
    console.log('🔍 Debug - Testing approval API with:', {
      workflowId,
      payload: approvalPayload,
      url: `${this.API_URL}/workflow-processes/${workflowId}/actions/approve`
    });
    
    return this.http.post<any>(`${this.API_URL}/workflow-processes/${workflowId}/actions/approve`, approvalPayload, { headers })
      .pipe(
        map(response => {
          console.log('🔍 Debug - Approval API response:', response);
          return response;
        }),
        catchError(error => {
          console.error('🔍 Debug - Approval API error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Debug method to test rejection API
   */
  debugRejectionAPI(workflowId: string, payload?: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    const rejectionPayload = payload || { approved: false };
    console.log('🔍 Debug - Testing rejection API with:', {
      workflowId,
      payload: rejectionPayload,
      url: `${this.API_URL}/workflow-processes/${workflowId}/actions/reject`
    });
    
    return this.http.post<any>(`${this.API_URL}/workflow-processes/${workflowId}/actions/reject`, rejectionPayload, { headers })
      .pipe(
        map(response => {
          console.log('🔍 Debug - Rejection API response:', response);
          return response;
        }),
        catchError(error => {
          console.error('🔍 Debug - Rejection API error:', error);
          return this.handleError(error);
        })
      );
  }
}
