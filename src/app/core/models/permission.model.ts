export interface Permission {
    id: string;
    name: string;
    code: number;
    label: string;
    description: string;
    p_category_id: string;
    created_at: string;
    updated_at: string;
}

export interface PermissionCategory {
    id: string;
    name: string;
    code: string;
    description: string;
    created_at: string | null;
    updated_at: string | null;
    permissions: Permission[];
}

export interface PermissionsResponse {
    status: boolean;
    message: string;
    data: PermissionCategory[];
} 