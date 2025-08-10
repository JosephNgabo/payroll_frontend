export interface Role {
    id: string;
    name: string;
    permissions: string[];
    created_at: string;
    updated_at: string;
}

export interface RolePermission {
    id: string;
    name: string;
    code: number;
    label: string;
    description: string;
    p_category_id: string;
    created_at: string;
    updated_at: string;
    pivot: {
        role_id: string;
        permission_id: string;
    };
}

export interface RoleDetail {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    permissions: RolePermission[];
}

export interface RoleDetailResponse {
    status: boolean;
    message: string;
    data: RoleDetail;
}

export interface CreateRolePayload {
    name: string;
    permissions: string[];
}

export interface UpdateRolePayload {
    name?: string;
    permissions?: string[];
}

export interface PaginatedRolesResponse {
    current_page: number;
    data: Role[];
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