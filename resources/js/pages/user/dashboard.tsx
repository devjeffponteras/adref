import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { WelcomeNote } from '@/components/welcome-note'; // Ensure file exists
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

// 1. Define item structure from your database
interface TemporaryAssetItem {
    id: number;
    refno: string | null;
    transid: string | null;
    status: string | null;
    accountable_personnel: string | null;
    brand_make: string | null;
    model: string | null;
    end_user_department: string | null;
}

// 2. Define Inertia Pagination structure
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
}

// 3. Define component props
interface Filters {
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_dir?: string;
}

interface UserDashboardProps {
    temporaryAssets: PaginatedData<TemporaryAssetItem>;
    filters: Filters;
}

// 4. Attach typed props to component
export default function UserDashboard({ temporaryAssets, filters }: UserDashboardProps) {
    const [search, setSearch] = useState<string>(filters?.search || '');
    const [perPage, setPerPage] = useState<number>(filters?.per_page || 10);
    const [sortBy, setSortBy] = useState<string>(filters?.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState<string>(filters?.sort_dir || 'desc');

    // Debounce search input
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                fetchData({ search, page: 1 });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const fetchData = (params: { search?: string; per_page?: number; sort_by?: string; sort_dir?: string; page?: number } = {}) => {
        router.get(
            '/user-dashboard', // Direct URL path
            {
                search: params.search ?? search,
                per_page: params.per_page ?? perPage,
                sort_by: params.sort_by ?? sortBy,
                sort_dir: params.sort_dir ?? sortDir,
                page: params.page ?? 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleSort = (column: string) => {
        const nextDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(nextDir);
        fetchData({ sort_by: column, sort_dir: nextDir, page: 1 });
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = parseInt(e.target.value);
        setPerPage(newLimit);
        fetchData({ per_page: newLimit, page: 1 });
    };

    const renderSortIcon = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 opacity-60 group-hover:opacity-100" />;
        return sortDir === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-zinc-800" />
        ) : (
            <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
        );
    };

    return (
        <>
            <Head title="User Dashboard" />

            <WelcomeNote />

            <div className="container-fluid p-4 space-y-6">
                
                {/* System Overview Info Banner */}
                <div className="rounded border border-gray-200 shadow bg-gray-50 p-4">
                    <h2 className="text-lg font-bold text-green-700">
                        Asset Disposal System Overview
                    </h2>

                    <p className="text-gray-600 text-sm pt-3 leading-normal">
                        The Asset Disposal System provides a structured mechanism for disposing of fixed assets and inventory items of Philsaga Mining Corporation and Mindanao Mineral Processing and Refining Corporation in an orderly and compliant manner. 
                        It ensures that assets reaching the final phase of their useful life particularly those that are obsolete, nonfunctional, or totally unusable are properly evaluated, documented, and disposed of using approved methods. 
                        The system also establishes management guidelines and accountability measures to support environmental and operational requirements, promoting efficient resource management while maintaining accurate records and regulatory compliance.
                    </p>
                </div>

                {/* Temporary Asset Applications Table Card */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                        <div>
                            <h3 className="text-base font-semibold text-zinc-800">
                                Asset Disposal Request Applications Registry (WORKFLOW)
                            </h3>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Real-time status of asset requests applications from ADREF to WORKFLOW System.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search applications..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-3 py-1.5 text-xs border border-zinc-300 rounded-lg bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-zinc-400 focus:bg-white transition-all w-full sm:w-64"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto bg-white">
                        <table className="w-full text-left text-xs text-zinc-700">
                            <thead className="bg-zinc-100/80 text-zinc-600 font-semibold uppercase tracking-wider border-b border-zinc-200">
                                <tr>
                                    <th onClick={() => handleSort('refno')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Ref No.</span>
                                            {renderSortIcon('refno')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('transid')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Trans ID</span>
                                            {renderSortIcon('transid')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('accountable_personnel')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Accountable Personnel</span>
                                            {renderSortIcon('accountable_personnel')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('brand_make')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Brand & Model</span>
                                            {renderSortIcon('brand_make')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('end_user_department')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Department</span>
                                            {renderSortIcon('end_user_department')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('status')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Status</span>
                                            {renderSortIcon('status')}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {temporaryAssets?.data?.length > 0 ? (
                                    temporaryAssets.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors text-sm">
                                            <td className="p-3 font-medium text-zinc-900">{item.refno || 'N/A'}</td>
                                            <td className="p-3 text-zinc-600">{item.transid || 'N/A'}</td>
                                            <td className="p-3 text-zinc-700">{item.accountable_personnel || 'N/A'}</td>
                                            <td className="p-3 text-zinc-700">
                                                {item.brand_make || item.model ? (
                                                    `${item.brand_make || ''} ${item.model || ''}`.trim()
                                                ) : (
                                                    <span className="text-zinc-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-zinc-700">{item.end_user_department || 'N/A'}</td>
                                            <td className="p-3">
                                                <span
                                                    className={`inline-flex uppercase items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                                        (item.status || 'Pending').toLowerCase() === 'approved'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                            : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                                                    }`}
                                                >
                                                    {item.status || 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center text-zinc-500">
                                            No temporary asset applications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer - Always visible */}
                    {temporaryAssets && (
                        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
                            <div>
                                Showing <span className="font-semibold text-zinc-800">{temporaryAssets.from || 0}</span> to{' '}
                                <span className="font-semibold text-zinc-800">{temporaryAssets.to || 0}</span> of{' '}
                                <span className="font-semibold text-zinc-800">{temporaryAssets.total || 0}</span> results
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-zinc-500 whitespace-nowrap">Per page:</label>
                                    <select
                                        value={perPage}
                                        onChange={handlePerPageChange}
                                        className="py-1.5 px-2 text-xs border border-zinc-300 rounded-lg bg-zinc-50 text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-zinc-400"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                {/* Render page buttons if there are multiple pages */}
                                {temporaryAssets.links && temporaryAssets.links.length > 3 && (
                                    <div className="flex items-center gap-1">
                                        {temporaryAssets.links.map((link, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!link.url}
                                                onClick={() => {
                                                    if (link.url) {
                                                        router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                                    }
                                                }}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-zinc-800 text-white'
                                                        : link.url
                                                        ? 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                                                        : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}

UserDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/user-dashboard',
        },
    ],
};