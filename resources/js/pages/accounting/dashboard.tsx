import { Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Folder, 
    CircleCheck, 
    XIcon, 
    FolderOpen, 
    ArrowUpDown, 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight 
} from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';

interface User {
    id: number;
    name: string;
}

interface inWorkflow {
    id: number;
    asset_id: number;
    workflow_step: number;
    status: string;
}

interface AccountingInformation {
    id: number;
    asset_number: string;
    acquisition_date: string;
    acquisition_cost: string;
    book_value: string;
    status: string;
}

interface Asset {
    id: number;
    control_number: string | null;
    accountable_personnel: string;
    model: string | null;
    brand_make: string | null;
    serial_plate_id_number: string | null;
    end_user_department: string;
    description: string | null;
    status: string;
    user?: User;
    accounting_information?: AccountingInformation | null;
    inWorkflow?: inWorkflow | null;
}

interface Approver {
    id: number;
    name: string;
}

interface AssetStatusData {
    id: number;
    seq_no: number;
    is_current: boolean;
    status: string;
    remarks: string | null;
    created_at: string;
    asset_id: number;
    asset: Asset | null;
    approver: Approver | null;
}

interface DashboardProps {
    assetStatuses: AssetStatusData[];
}

type SortableFields = 'created_at' | 'control_number' | 'department' | 'submitted_by' | 'brand_make';

export default function AccountingDashboard({ assetStatuses = [] }: DashboardProps) {
    const { flash } = usePage().props as any;

    const pendingTransactions = assetStatuses?.filter(item => item.status === 'On-going') || [];
    const evaluatedTransactions = assetStatuses?.filter(item => item.asset?.accounting_information).length || 0;

    // Sorting States
    const [sortField, setSortField] = useState<SortableFields>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Sorting Handler
    const handleSort = (field: SortableFields) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    // Dynamic Filtered and Sorted Array Core
    const sortedAssetStatuses = useMemo(() => {
        const result = [...assetStatuses];

        result.sort((a, b) => {
            let valA: any = '';
            let valB: any = '';

            switch (sortField) {
                case 'created_at':
                    valA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    valB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    break;
                case 'control_number':
                    valA = a.asset?.control_number || '';
                    valB = b.asset?.control_number || '';
                    break;
                case 'department':
                    valA = a.asset?.end_user_department || '';
                    valB = b.asset?.end_user_department || '';
                    break;
                case 'brand_make':
                    valA = a.asset?.brand_make || '';
                    valB = b.asset?.brand_make || '';
                    break;
                case 'submitted_by':
                    valA = a.approver?.name || 'System Auto';
                    valB = b.approver?.name || 'System Auto';
                    break;
            }

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [assetStatuses, sortField, sortDirection]);

    // Derived Pagination Calculations
    const totalItems = sortedAssetStatuses.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    const paginatedAssetStatuses = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedAssetStatuses.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedAssetStatuses, currentPage, itemsPerPage]);

    const pageNumbers = useMemo(() => {
        const numbers = [];
        for (let i = 1; i <= totalPages; i++) {
            numbers.push(i);
        }
        return numbers;
    }, [totalPages]);

    return (
        <>
            <Head title="Asid Dashboard" />

            {/* sub header */}
            <WelcomeNote />
            
            {/* main content */}
            <div className="container-fluid p-4">

                {flash?.success && (
                    <div className="mb-4 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center shadow-xs animate-fade-in">
                        <CircleCheck className="h-5 w-5 mr-2 text-emerald-600" />
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center shadow-xs">
                        <XIcon className="h-5 w-5 mr-2 text-red-600" />
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-linear-to-br from-amber-50 to-orange-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-orange-500/5">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-amber-200/20 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/80">Pending Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight text-amber-950">{pendingTransactions.length}</h2>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-100">
                                <Folder className='h-6 w-6 text-amber-600' />
                            </div>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-emerald-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-emerald-500/5">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-200/20 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/80">All Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight text-emerald-950">{evaluatedTransactions}</h2>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                                <FolderOpen className='h-6 w-6 text-emerald-600' />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-6 overflow-hidden rounded-2xl border border-zinc-100 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-800">
                                <tr>
                                    <th scope="col" onClick={() => handleSort('created_at')} className="py-3.5 pl-6 pr-3 font-semibold cursor-pointer hover:bg-gray-200 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Application Date &amp; Time <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                                    </th>
                                    <th scope="col" onClick={() => handleSort('control_number')} className="px-4 py-3.5 font-semibold cursor-pointer hover:bg-gray-200 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Asset Control Number <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                                    </th>
                                    <th scope="col" onClick={() => handleSort('department')} className="px-4 py-3.5 font-semibold cursor-pointer hover:bg-gray-200 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Department <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                                    </th>
                                    <th scope="col" onClick={() => handleSort('brand_make')} className="px-4 py-3.5 font-semibold cursor-pointer hover:bg-gray-200 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Brand & Model <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                                    </th>
                                    <th scope="col" onClick={() => handleSort('submitted_by')} className="px-4 py-3.5 font-semibold cursor-pointer hover:bg-gray-200 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Submitted By <ArrowUpDown className="h-3 w-3 text-gray-500" /></div>
                                    </th>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center select-none">Status / Action</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {paginatedAssetStatuses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No active asset disposal data found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedAssetStatuses.map((item) => {
                                        const isLogged = !!item.asset?.accounting_information;
                                        const formattedDate = item.created_at 
                                            ? new Date(item.created_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : 'No Date Recorded';

                                        return (
                                            <tr key={item.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                                <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.asset?.control_number || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                    <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'Asset Department'}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-50">{item.remarks || '—'}</div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-700">
                                                    {item?.asset?.brand_make || 'Brand'} {item?.asset?.model || 'Model'}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-700">
                                                    {item.approver?.name || 'System Auto'}
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <Link 
                                                        href={`/accounting-evaluate/${item.asset_id}`} 
                                                        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-lg
                                                            ${isLogged 
                                                                ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 border border-gray-200 shadow-sm' 
                                                                : 'text-amber-500 hover:text-amber-700 outline-1 outline-amber-300 hover:bg-amber-50'
                                                            }`}
                                                    >
                                                        {isLogged ? 'View' : 'Evaluate'}
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                        
                        {/* Pagination Control Bar */}
                        {totalItems > 0 && (
                            <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-600">
                                <div className="flex items-center gap-4">
                                    <span>
                                        Showing {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
                                    </span>
                                </div>

                                <div className="inline-flex space-x-1 items-center">
                                    <div className="flex items-center gap-2 mr-2">
                                        <span>Rows:</span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1); 
                                            }}
                                            className="px-2 py-1 rounded border border-gray-200 bg-white focus:outline-hidden text-xs font-medium text-gray-700 cursor-pointer"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>

                                    {/* First Page */}
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(1)}
                                        className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                        title="First Page"
                                    >
                                        <span className="w-4 h-4"><ChevronsLeft className="w-4 h-4" /></span>
                                    </button>

                                    {/* Previous Page */}
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                        title="Previous Page"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    
                                    {/* Dynamic Numeric Pages */}
                                    {pageNumbers.map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                                                currentPage === page
                                                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                                                    : 'bg-white text-slate-700 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    {/* Next Page */}
                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                        title="Next Page"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    {/* Last Page */}
                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                        title="Last Page"
                                    >
                                        <ChevronsRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
            </div>
        </>
    );
}

AccountingDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/accounting-dashboard',
        },
    ],
};