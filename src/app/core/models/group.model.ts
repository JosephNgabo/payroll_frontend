export interface Group {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    roles: string[];
    users: string[];
}

export interface GroupDetail {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    roles: GroupRole[];
    users: GroupUser[];
    permissions: GroupPermission[];
}

export interface GroupRole {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    pivot: {
        group_id: string;
        role_id: string;
    };
}

export interface GroupUser {
    id: string;
    name: string;
    email: string;
    username: string;
    created_at: string;
    updated_at: string;
    pivot: {
        group_id: string;
        user_id: string;
    };
}

export interface GroupPermission {
    id: string;
    name: string;
    code: number;
    label: string;
    description: string;
    p_category_id: string;
    created_at: string;
    updated_at: string;
    pivot: {
        group_id: string;
        permission_id: string;
    };
}

export interface GroupDetailResponse {
    status: boolean;
    message: string;
    data: GroupDetail;
}

export interface CreateGroupPayload {
    name: string;
    description?: string;
    roles?: string[];
    users?: string[];
    permissions?: string[];
}

export interface UpdateGroupPayload {
    name?: string;
    description?: string;
    roles?: string[];
    users?: string[];
    permissions?: string[];
}

export interface PaginatedGroupsResponse {
    current_page: number;
    data: Group[];
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