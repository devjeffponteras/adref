import { Head, usePage, Link } from '@inertiajs/react';
import { WelcomeNote } from '@/components/welcome-note';
import { 
    CircleCheck, 
    XIcon, 
    PlusIcon, 
    PencilIcon, 
    Trash2Icon, 
    UserIcon,
    ShieldIcon
} from 'lucide-react';
import { User } from '@/types/models'; // Imported cleanly from your centralized models type file!

export interface DashboardProps {
    users: User[];
}

export default function UserManagement({ users = [] }: DashboardProps) {
    const { flash } = usePage().props as any;

    return (
        <>
            <Head title="User Management Dashboard" />

            {/* Sub Header */}
            <WelcomeNote />
            
            {/* Main Content Container */}
            <div className="container-fluid p-6">

                {/* Flash Messages Notifications */}
                {flash?.success && (
                    <div className="mb-6 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center shadow-xs animate-fade-in">
                        <CircleCheck className="h-5 w-5 mr-2 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center shadow-xs">
                        <XIcon className="h-5 w-5 mr-2 text-red-600 shrink-0" />
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                {/* Main Table Card Layout */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
                    
                    {/* Integrated Section Header Component */}
                    <div className="p-5 border-b border-gray-200 bg-gray-50/50 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-gray-500" />
                                System User Registry
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Manage operational permissions, credentials, and active staff directory access lines.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Link
                                href="/admin/user-management/create"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs focus:outline-hidden transition-colors duration-150"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Create User
                            </Link>
                        </div>
                    </div>

                    {/* Table Render Wrapper */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-left">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-3.5">User Details</th>
                                    <th scope="col" className="px-6 py-3.5">System Roles</th>
                                    <th scope="col" className="px-6 py-3.5">Status Check</th>
                                    <th scope="col" className="px-6 py-3.5 text-right">Actions Matrix</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm text-gray-700 bg-white">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400 font-medium">
                                            No registered profiles matched active data pools. Click "Create User" to establish entries.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/70 transition-colors duration-100">
                                            {/* Primary Info Segment */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm uppercase">
                                                        {user.name.substring(0, 2)}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="font-semibold text-gray-900">{user.name}</div>
                                                        <div className="text-xs text-gray-500">{user.email || 'no-email@system.com'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* Role Allocation Badge Block */}
                                            <td className="px-6 py-4 whitespace-nowrap align-middle">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider text-[10px]">
                                                    <ShieldIcon className="h-3 w-3 text-blue-500" />
                                                    {user.role?.name || 'Staff Operator'}
                                                </span>
                                            </td>

                                            {/* Access Status Conditional Logic */}
                                            <td className="px-6 py-4 whitespace-nowrap align-middle">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${user.status === 'Inactive' 
                                                        ? 'bg-amber-100 text-amber-800' 
                                                        : 'bg-emerald-100 text-emerald-800'
                                                    }`}
                                                >
                                                    {user.status || 'Active'}
                                                </span>
                                            </td>

                                            {/* Interactive Icon Link Control Stacks */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-medium align-middle">
                                                <div className="inline-flex items-center gap-2">
                                                    <Link
                                                        href={`/users/${user.id}/edit`}
                                                        title="Modify User Details"
                                                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-colors duration-150 shadow-xs"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        // method="delete"
                                                        as="button"
                                                        // href={`/users/${user.id}`}
                                                        href='#'
                                                        title="Revoke System Access"
                                                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors duration-150 shadow-xs cursor-pointer"
                                                    >
                                                        <Trash2Icon className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
}

UserManagement.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'User Management',
        },
    ],
};