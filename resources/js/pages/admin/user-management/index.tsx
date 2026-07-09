import { useState, useMemo } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { 
    CircleCheck, 
    XIcon, 
    PlusIcon, 
    PencilIcon, 
    Trash2Icon, 
    UserIcon,
    ShieldIcon,
    AlertTriangleIcon,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import type { User } from '@/types/models';

export interface DashboardProps {
    users: User[];
}

type SortableFields = 'name' | 'role' | 'status';

export default function UserManagement({ users = [] }: DashboardProps) {
    const { flash } = usePage().props as any;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Sorting States
    const [sortField, setSortField] = useState<SortableFields>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Pagination States
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    const openDeleteConfirmation = (user: User) => {
        setUserToDelete(user);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setUserToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (!userToDelete) return;

        router.post(`/admin/user-management/delete/${userToDelete.id}`, {}, {
            onSuccess: () => closeDeleteModal(),
            onError: () => closeDeleteModal(),
        });
    };

    // Sorting Handler
    const handleSort = (field: SortableFields) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset page balance on sort matrix shift
    };

    // Sort Computational Pipeline
    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            let valA: string = '';
            let valB: string = '';

            switch (sortField) {
                case 'name':
                    valA = a.name || '';
                    valB = b.name || '';
                    break;
                case 'role':
                    valA = a.role?.name || 'Staff Operator';
                    valB = b.role?.name || 'Staff Operator';
                    break;
                case 'status':
                    valA = a.status || 'Active';
                    valB = b.status || 'Active';
                    break;
            }

            valA = valA.toLowerCase();
            valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [users, sortField, sortDirection]);

    // Dynamic Pagination Splits
    const totalItems = sortedUsers.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    const displayedUsers = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return sortedUsers.slice(start, end);
    }, [sortedUsers, currentPage, rowsPerPage]);

    const entryRange = useMemo(() => {
        if (totalItems === 0) return { start: 0, end: 0 };
        const start = (currentPage - 1) * rowsPerPage + 1;
        const end = Math.min(currentPage * rowsPerPage, totalItems);
        return { start, end };
    }, [currentPage, rowsPerPage, totalItems]);

    return (
        <>
            <Head title="User Management Dashboard" />

            {/* Sub Header */}
            {/* <WelcomeNote /> */}
            
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
                        <div className="mt-4 sm:mt-0 flex items-center gap-3">
                            {/* Rows Limit Controls */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500 whitespace-nowrap">Rows:</span>
                                <select 
                                    value={rowsPerPage} 
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-md border border-gray-300 bg-white py-1 px-2 text-xs font-medium text-gray-700 shadow-xs focus:border-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-zinc-500 cursor-pointer"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

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
                                    <th scope="col" onClick={() => handleSort('name')} className="px-6 py-3.5 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">User Details <ArrowUpDown className="h-3 w-3 text-gray-400" /></div>
                                    </th>
                                    <th scope="col" onClick={() => handleSort('role')} className="px-6 py-3.5 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">System Roles <ArrowUpDown className="h-3 w-3 text-gray-400" /></div>
                                    </th>
                                    <th scope="col" onClick={() => handleSort('status')} className="px-6 py-3.5 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Status Check <ArrowUpDown className="h-3 w-3 text-gray-400" /></div>
                                    </th>
                                    <th scope="col" className="px-6 py-3.5 text-right">Actions Matrix</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm text-gray-700 bg-white">
                                {displayedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400 font-medium">
                                            No registered profiles matched active data pools. Click "Create User" to establish entries.
                                        </td>
                                    </tr>
                                ) : (
                                    displayedUsers.map((user) => (
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

                                            {/* Interactive Action Control Elements */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-medium align-middle">
                                                <div className="inline-flex items-center gap-2">
                                                    <Link
                                                        href={`/admin/user-management/edit/${user.id}`}
                                                        title="Modify User Details"
                                                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-colors duration-150 shadow-xs"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Link>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteConfirmation(user)}
                                                        title="Revoke System Access"
                                                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors duration-150 shadow-xs cursor-pointer focus:outline-hidden"
                                                    >
                                                        <Trash2Icon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Segment */}
                    {totalItems > 0 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
                            <div className="text-xs text-gray-500">
                                Showing <span className="font-semibold text-gray-700">{entryRange.start}</span> to{' '}
                                <span className="font-semibold text-gray-700">{entryRange.end}</span> of{' '}
                                <span className="font-semibold text-gray-700">{totalItems}</span> items
                            </div>
                            
                            <div className="flex items-center gap-1">
                                {/* Rows Limit Controls */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-gray-500 whitespace-nowrap">Rows:</span>
                                    <select 
                                        value={rowsPerPage} 
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="rounded-md border border-gray-300 bg-white py-1 px-2 text-xs font-medium text-gray-700 shadow-xs focus:border-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-zinc-500 cursor-pointer"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-2xs hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer focus:outline-hidden"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus:outline-hidden ${
                                            currentPage === page
                                                ? 'bg-zinc-800 text-white hover:bg-zinc-900'
                                                : 'border border-gray-200 bg-white text-gray-600 hover:bg-zinc-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 shadow-2xs hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer focus:outline-hidden"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs transition-opacity duration-200 animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden transform scale-100 transition-transform duration-200">
                        
                        {/* Modal Body Header Details */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                                    <AlertTriangleIcon className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Confirm Account Revocation</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone automatically.</p>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-relaxed">
                                Are you sure you want to permanently erase <span className="font-bold text-gray-900">{userToDelete?.name}</span> ({userToDelete?.email || 'no email registered'}) from active staff directories? All operational access rights will be terminated.
                            </p>
                        </div>

                        {/* Modal Action Controls Footer */}
                        <div className="bg-gray-50/70 border-t border-gray-200 px-6 py-3.5 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="px-3.5 py-2 border border-gray-300 text-xs font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150 cursor-pointer focus:outline-hidden"
                            >
                                Abort Operational Request
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-150 cursor-pointer shadow-xs focus:outline-hidden"
                            >
                                Confirm Erase Data
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

UserManagement.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'User Management' },
    ],
};