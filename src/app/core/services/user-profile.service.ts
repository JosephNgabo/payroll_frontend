import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    constructor(private http: HttpClient) { }

    /**
     * Get all users
     */
    getAll() {
        return this.http.get<User[]>(`api/users`);
    }

    /**
     * Fake User Register
     * @param user user details
     */
    register(user: User) {
        return this.http.post(`/users/register`, user);
    }
} 