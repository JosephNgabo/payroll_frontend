export interface UserDetail {
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
    is_active: number;
    login_attempts: number;
    avatar: string | null;
    language: string;
    user_profile: string;
}

export interface PaginatedUsersResponse {
    current_page: number;
    data: UserDetail[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
} 