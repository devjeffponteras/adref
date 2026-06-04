import { Link, usePage } from '@inertiajs/react';

import {
    LayoutGrid,
    Inbox,
    FileSpreadsheet,
    PackageOpen,
    ClipboardPen,
    SquareUserRound,
    ScanSearch,
    BriefcaseBusiness,
    LucideUserCog2,
    UsersRound,
    Gavel
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import {
    dashboard,
    asidDashboard,
    mcdDashboard,
    userDashboard,
    accountingDashboard,
    disposals,
    bidding,
    forms,
    reports,
    profile,
    myAssets,
    scanLogAsset
} from '@/routes';

import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        icon: LayoutGrid,
        roles: ['admin', 'asid', 'mcd', 'user', 'mapeo', 'accounting'],
        href: '/dashboard',
    },
    {
        title: 'Asset for Disposal',
        href: disposals(),
        icon: PackageOpen,
        roles: ['admin'],
    },
    {
        title: 'Assets for Bidding',
        href: bidding(),
        icon: Inbox,
    },
    {
        title: 'Scan/Log Asset',
        href: scanLogAsset(),
        icon: ScanSearch,
        roles: ['user'],
    },
    {
        title: 'My Assets',
        href: myAssets(),
        icon: BriefcaseBusiness,
        roles: ['user'],
    },
    {
        title: 'My Forms',
        href: forms(),
        icon: FileSpreadsheet,
    },
    {
        title: 'My Reports',
        href: reports(),
        icon: ClipboardPen,
        roles: ['admin'],
    },
    {
        title: 'My Profile',
        href: profile(),
        icon: SquareUserRound,
    },
    {
        title: 'Bidding',
        href: '/admin/bidding/index',
        icon: Gavel,
        roles: ['admin'],
    },
    {
        title: 'User Management',
        href: '/admin/user-management/index',
        icon: LucideUserCog2,
        roles: ['admin'],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;

    const userRole = auth?.user?.role?.name?.toLowerCase() || 'user';
    console.log("Current Login Account Type: " + userRole);

    const resolveDashboardRoute = (role: string) => {
        const routes: Record<string, any> = {
            admin: dashboard(),
            asid:  asidDashboard(),
            mcd:   mcdDashboard(),
            user:  userDashboard(),
            mapeo: userDashboard(),
            accounting: accountingDashboard(),
        };
        return routes[role] || userDashboard();
    };

    const filteredNavItems: NavItem[] = mainNavItems
        .filter((item) => {
            if (!item.roles) return true;
            return item.roles.includes(userRole);
        })
        .map((item) => {
            if (item.href === '/dashboard') {
                return {
                    ...item,
                    href: resolveDashboardRoute(userRole)
                };
            }
            return item;
        });

    const homeRoute = resolveDashboardRoute(userRole);

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeRoute} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}