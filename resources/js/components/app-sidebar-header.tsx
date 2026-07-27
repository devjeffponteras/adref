import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { url } = usePage();
    const { auth } = usePage().props as any;

    const hiddenRoutes = ['/my-assets', '/create-asset'];
    const isHidden = hiddenRoutes.some((route) => url.startsWith(route));
    const isUser = auth?.user?.role?.name === 'user';

    return (
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {!isHidden && isUser && (
                <a href="/create-asset" className="px-4 py-2 my-2 text-white bg-emerald-600 border-emerald-700 shadow hover:bg-emerald-700 cursor-pointer rounded-xl flex flex-row items-center gap-2">
                    <PackagePlus className="w-5 h-5" />
                    Create Asset Request
                </a>
            )}
        </header>
    );
}