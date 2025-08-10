import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 2,
        label: 'MENUITEMS.DASHBOARDS.LIST.DEFAULT',
        icon: 'bx-home-circle',
        link: '/dashboard',
        p_id:1,
    },
    {
        id: 3,
        isLayout: true
    },
    {
        id: 4,
        label: 'Access Management',
        icon: 'bx-user-circle',
        p_id:1001,
        subItems: [
            {
                id: 6,
                label: 'Users',
                link: '/users',
                p_id:1001,
                parentId: 4
            },
            {
                id: 8,
                label: 'Roles',
                link: '/access-management/roles',
                p_id:1010,
                parentId: 4
            },
            {
                id: 9,
                label: 'Groups',
                link: '/access-management/groups',
                p_id:1020,
                parentId: 4
            }
        ]
    },
    {
        id: 5,
        label: 'Deductions',
        icon: 'bx-cog',
        p_id:3001,
        subItems: [
            {
                id: 51,
                label: 'RSSB Deductions',
                link: '/deductions',
                parentId: 5,
                p_id:3001
            },
            {
                id: 52,
                label: 'Other Deductions',
                link: '/deductions/other-deductions',
                parentId: 6,
                p_id:3001
            }
        ]
    },
    {
        id: 6,
        label: 'Employees',
        icon: 'bx-cog',
        link: '/employees/employees-view',   
    },
    {
        id: 7,
        label: 'Allowance & Benefits',
        icon: 'bx-cog',
        link: '/allowance-benefits',
        p_id:2001,
    },
    {
        id: 8,
        label: 'Departments',
        icon: 'bx-cog',
        link: '/departments',
        p_id:5001,
    },
    {
        id: 9,
        label: 'Payroll',
        icon: 'bx-calculator',
        link: '/payroll/list',
        p_id:6001,
    },
    {
        id: 10,
        isLayout: true
    },
//employee portal
    {
        id: 112,
        label: 'Leave Management',
        link: '/employee-portal/leave-management',
        parentId: 11,
        p_id:7003
    },
    {
        id: 113,
        label: 'Payslips',
        link: '/employee-portal/payslips',
        parentId: 11,
        p_id:7001
    },
    {
        id: 115,
        label: 'Profile',
        link: '/employee-portal/profile',
        parentId: 11
    }

];

