import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 2,
        label: 'MENUITEMS.DASHBOARDS.LIST.DEFAULT',
        icon: 'bx-home-circle',
        link: '/dashboard',
        // subItems: [
        //     {
        //         id: 3,
        //         label: 'MENUITEMS.DASHBOARDS.LIST.DEFAULT',
        //         link: '/dashboard',
        //         parentId: 2
        //     }
        // ]
    },
    {
        id: 3,
        isLayout: true
    },
    // {
    //     id: 4,
    //     label: 'Access Management',
    //     isTitle: true
    // },
    {
        id: 4,
        label: 'Access Management',
        icon: 'bx-user-circle',
        subItems: [
            {
                id: 6,
                label: 'Users',
                link: '/users',
                parentId: 4
            },
            {
                id: 7,
                label: 'Permissions',
                parentId: 4
            },
            {
                id: 8,
                label: 'Groups',
                parentId: 4
            }
        ]
    },
    {
        id: 5,
        label: 'Deductions Management',
        icon: 'bx-cog',
        link: '/deductions'
    },
    {
        id: 6,
        label: 'Employee Management',
        icon: 'bx-cog',
        link: '/employees',    
        // subItems: [
        //     {
        //         id: 9,
        //         label: 'Deductions Management',
        //         link: '/deductions',
        //         parentId: 5
        //     }
        // ]
    },
    {
        id: 7,
        label: 'Allowance & Benefits',
        icon: 'bx-cog',
        link: '/allowance-benefits'
    },
    {
        id: 8,
        label: 'Departments',
        icon: 'bx-cog',
        link: '/departments'
    }


    /* Commented out menu items
    {
        id: 412,
        label: 'MENUITEMS.PAGES.TEXT',
        isTitle: true
    },
    {
        id: 417,
        label: 'MENUITEMS.AUTHENTICATION.TEXT',
        icon: 'bx-user-circle',
        subItems: [
            {
                id: 418,
                label: 'MENUITEMS.AUTHENTICATION.LIST.LOGIN',
                link: '/account/login',
                parentId: 417
            },
            {
                id: 419,
                label: 'MENUITEMS.AUTHENTICATION.LIST.REGISTER',
                link: '/account/register',
                parentId: 417
            },
            {
                id: 420,
                label: 'MENUITEMS.AUTHENTICATION.LIST.RECOVERPWD',
                link: '/account/recoverpwd',
                parentId: 417
            },
            {
                id: 421,
                label: 'MENUITEMS.AUTHENTICATION.LIST.LOCKSCREEN',
                link: '/account/lock-screen',
                parentId: 417
            }
        ]
    },
    {
        id: 508,
        label: 'MENUITEMS.UTILITY.TEXT',
        icon: 'bx-file',
        subItems: [
            {
                id: 509,
                label: 'MENUITEMS.UTILITY.LIST.STARTER',
                link: '/pages/starter',
                parentId: 508
            },
            {
                id: 510,
                label: 'MENUITEMS.UTILITY.LIST.MAINTENANCE',
                link: '/pages/maintenance',
                parentId: 508
            },
            {
                id: 511,
                label: 'MENUITEMS.UTILITY.LIST.COMINGSOON',
                link: '/pages/coming-soon',
                parentId: 508
            },
            {
                id: 512,
                label: 'MENUITEMS.UTILITY.LIST.TIMELINE',
                link: '/pages/timeline',
                parentId: 508
            },
            {
                id: 513,
                label: 'MENUITEMS.UTILITY.LIST.FAQS',
                link: '/pages/faqs',
                parentId: 508
            },
            {
                id: 514,
                label: 'MENUITEMS.UTILITY.LIST.PRICING',
                link: '/pages/pricing',
                parentId: 508
            },
            {
                id: 515,
                label: 'MENUITEMS.UTILITY.LIST.ERROR404',
                link: '/pages/404',
                parentId: 508
            },
            {
                id: 516,
                label: 'MENUITEMS.UTILITY.LIST.ERROR500',
                link: '/pages/500',
                parentId: 508
            }
        ]
    },
    {
        id: 563,
        label: 'MENUITEMS.COMPONENTS.TEXT',
        isTitle: true
    },
    {
        id: 564,
        label: 'MENUITEMS.UIELEMENTS.TEXT',
        icon: 'bx-tone',
        subItems: [
            {
                id: 565,
                label: 'MENUITEMS.UIELEMENTS.LIST.ALERTS',
                link: '/ui/alerts',
                parentId: 564
            },
            {
                id: 566,
                label: 'MENUITEMS.UIELEMENTS.LIST.BUTTONS',
                link: '/ui/buttons',
                parentId: 564
            },
            {
                id: 567,
                label: 'MENUITEMS.UIELEMENTS.LIST.CARDS',
                link: '/ui/cards',
                parentId: 564
            },
            {
                id: 568,
                label: 'MENUITEMS.UIELEMENTS.LIST.CAROUSEL',
                link: '/ui/carousel',
                parentId: 564
            },
            {
                id: 569,
                label: 'MENUITEMS.UIELEMENTS.LIST.DROPDOWNS',
                link: '/ui/dropdowns',
                parentId: 564
            },
            {
                id: 570,
                label: 'MENUITEMS.UIELEMENTS.LIST.GRID',
                link: '/ui/grid',
                parentId: 564
            },
            {
                id: 571,
                label: 'MENUITEMS.UIELEMENTS.LIST.IMAGES',
                link: '/ui/images',
                parentId: 564
            },
            {
                id: 572,
                label: 'MENUITEMS.UIELEMENTS.LIST.LIGHTBOX',
                link: '/ui/lightbox',
                parentId: 564
            },
            {
                id: 573,
                label: 'MENUITEMS.UIELEMENTS.LIST.MODALS',
                link: '/ui/modals',
                parentId: 564
            },
            {
                id: 574,
                label: 'MENUITEMS.UIELEMENTS.LIST.RANGESLIDER',
                link: '/ui/rangeslider',
                parentId: 564
            },
            {
                id: 575,
                label: 'MENUITEMS.UIELEMENTS.LIST.SESSIONTIMEOUT',
                link: '/ui/session-timeout',
                parentId: 564
            },
            {
                id: 576,
                label: 'MENUITEMS.UIELEMENTS.LIST.PROGRESSBARS',
                link: '/ui/progressbars',
                parentId: 564
            },
            {
                id: 577,
                label: 'MENUITEMS.UIELEMENTS.LIST.PLACEHOLDERS',
                link: '/ui/placeholders',
                parentId: 564
            },
            {
                id: 578,
                label: 'MENUITEMS.UIELEMENTS.LIST.SWEETALERT',
                link: '/ui/sweet-alert',
                parentId: 564
            },
            {
                id: 579,
                label: 'MENUITEMS.UIELEMENTS.LIST.TABS',
                link: '/ui/tabs-accordions',
                parentId: 564
            },
            {
                id: 580,
                label: 'MENUITEMS.UIELEMENTS.LIST.TYPOGRAPHY',
                link: '/ui/typography',
                parentId: 564
            },
            {
                id: 581,
                label: 'MENUITEMS.UIELEMENTS.LIST.VIDEO',
                link: '/ui/video',
                parentId: 564
            },
            {
                id: 582,
                label: 'MENUITEMS.UIELEMENTS.LIST.GENERAL',
                link: '/ui/general',
                parentId: 564
            },
            {
                id: 583,
                label: 'MENUITEMS.UIELEMENTS.LIST.COLORS',
                link: '/ui/colors',
                parentId: 564
            },
            {
                id: 584,
                label: 'MENUITEMS.UIELEMENTS.LIST.RATING',
                link: '/ui/rating',
                parentId: 564
            },
            {
                id: 585,
                label: 'MENUITEMS.UIELEMENTS.LIST.NOTIFICATIONS',
                link: '/ui/notifications',
                parentId: 564
            }
        ]
    },
    {
        id: 586,
        label: 'MENUITEMS.FORMS.TEXT',
        icon: 'bxs-eraser',
        badge: {
            variant: 'danger',
            text: 'MENUITEMS.FORMS.BADGE',
        },
        subItems: [
            {
                id: 587,
                label: 'MENUITEMS.FORMS.LIST.ELEMENTS',
                link: '/form/elements',
                parentId: 586
            },
            {
                id: 588,
                label: 'MENUITEMS.FORMS.LIST.VALIDATION',
                link: '/form/validation',
                parentId: 586
            },
            {
                id: 589,
                label: 'MENUITEMS.FORMS.LIST.ADVANCED',
                link: '/form/advanced',
                parentId: 586
            },
            {
                id: 590,
                label: 'MENUITEMS.FORMS.LIST.EDITOR',
                link: '/form/editor',
                parentId: 586
            },
            {
                id: 591,
                label: 'MENUITEMS.FORMS.LIST.FILEUPLOAD',
                link: '/form/uploads',
                parentId: 586
            },
            {
                id: 592,
                label: 'MENUITEMS.FORMS.LIST.REPEATER',
                link: '/form/repeater',
                parentId: 586
            },
            {
                id: 593,
                label: 'MENUITEMS.FORMS.LIST.WIZARD',
                link: '/form/wizard',
                parentId: 586
            },
            {
                id: 594,
                label: 'MENUITEMS.FORMS.LIST.MASK',
                link: '/form/mask',
                parentId: 586
            }
        ]
    },
    {
        id: 595,
        label: 'MENUITEMS.TABLES.TEXT',
        icon: 'bx-table',
        subItems: [
            {
                id: 596,
                label: 'MENUITEMS.TABLES.LIST.BASIC',
                link: '/tables/basic',
                parentId: 595
            },
            {
                id: 597,
                label: 'MENUITEMS.TABLES.LIST.ADVANCED',
                link: '/tables/advanced',
                parentId: 595
            }
        ]
    },
    {
        id: 598,
        label: 'MENUITEMS.CHARTS.TEXT',
        icon: 'bx-bar-chart-alt-2',
        subItems: [
            {
                id: 599,
                label: 'MENUITEMS.CHARTS.LIST.APEX',
                link: '/charts/apex',
                parentId: 598
            },
            {
                id: 600,
                label: 'MENUITEMS.CHARTS.LIST.ECHARTS',
                link: '/charts/echart',
                parentId: 598
            },
            {
                id: 601,
                label: 'MENUITEMS.CHARTS.LIST.CHARTJS',
                link: '/charts/chartjs',
                parentId: 598
            },
            {
                id: 602,
                label: 'MENUITEMS.CHARTS.LIST.CHARTIST',
                link: '/charts/chartist',
                parentId: 598
            },
            {
                id: 603,
                label: 'MENUITEMS.CHARTS.LIST.GOOGLE',
                link: '/charts/google',
                parentId: 598
            }
        ]
    },
    {
        id: 604,
        label: 'MENUITEMS.ICONS.TEXT',
        icon: 'bx-brush',
        subItems: [
            {
                id: 605,
                label: 'MENUITEMS.ICONS.LIST.BOXICONS',
                link: '/icons/boxicons',
                parentId: 604
            },
            {
                id: 606,
                label: 'MENUITEMS.ICONS.LIST.MATERIALDESIGN',
                link: '/icons/materialdesign',
                parentId: 604
            },
            {
                id: 607,
                label: 'MENUITEMS.ICONS.LIST.DRIPICONS',
                link: '/icons/dripicons',
                parentId: 604
            },
            {
                id: 608,
                label: 'MENUITEMS.ICONS.LIST.FONTAWESOME',
                link: '/icons/fontawesome',
                parentId: 604
            }
        ]
    },
    {
        id: 609,
        label: 'MENUITEMS.MAPS.TEXT',
        icon: 'bx-map',
        subItems: [
            {
                id: 610,
                label: 'MENUITEMS.MAPS.LIST.GOOGLEMAP',
                link: '/maps/google',
                parentId: 609
            },
            {
                id: 611,
                label: 'MENUITEMS.MAPS.LIST.LEAFLET',
                link: '/maps/leaflet',
                parentId: 609
            }
        ]
    }
    */
];

