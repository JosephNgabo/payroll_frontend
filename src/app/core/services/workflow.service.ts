import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LaravelAuthService } from './laravel-auth.service';

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
}
