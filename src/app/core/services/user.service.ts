import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/store/Authentication/auth.models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedUsersResponse, UserDetail } from '../models/user.model';
import { LaravelAuthService } from './laravel-auth.service';

// Define a type for the create user payload
export type CreateUserPayload = Omit<UserDetail, 'id' | 'id_util' | 'verified_at' | 'created_at' | 'updated_at' | 'deleted_at' | 'login_attempts' | 'avatar'> & { password?: string };

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authService: LaravelAuthService
  ) {}

  /**
   * Get a paginated list of users
   * @param page The page number to fetch
   */
  getUsers(page: number = 1): Observable<PaginatedUsersResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<PaginatedUsersResponse>(`${this.API_URL}/user?page=${page}`, { headers });
  }

  /**
   * Create a new user
   * @param userData The data for the new user
   */
  createUser(userData: CreateUserPayload): Observable<UserDetail> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<UserDetail>(`${this.API_URL}/user`, userData, { headers });
  }
}
