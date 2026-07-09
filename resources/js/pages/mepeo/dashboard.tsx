import { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Folder, CircleCheck, XIcon, FolderCheck, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';

interface User {
    id: number;
    name: string;
}

interface McdInformation {
    id: number;
    asset_number: string;
    acquisition_date: string;
    acquisition_cost: string;
    book_value: string;
    status: string;
}

interface MepeoInformation {
    id: number;
    asset_id: number;
    approver_id: number;
    waste_classification_id: string;
    waste_characteristic_id: string;
    remarks: string;
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
    mcd_information?: McdInformation | null;
    mepeo_information?: MepeoInformation | null;
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

type SortField = 'date' | 'control_number' | 'department' | 'submitted_by';
type SortDirection = 'asc' | 'desc' | null;

export default function MepeoDashboard({ assetStatuses }: DashboardProps) {
    const { flash } = usePage().props as any;

    // Table Controls States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    // Baseline counters for metrics cards
    const pendingTransactions = useMemo(() => {
        return assetStatuses?.filter(item => {
            const isMcdApproved = item?.asset?.mcd_information?.status === 'Approved';
            const isMepeoNotExist = !item?.asset?.mepeo_information;
            return isMcdApproved && isMepeoNotExist;
        }) || [];
    }, [assetStatuses]);

    const evaluatedTransactionsCount = useMemo(() => {
        return assetStatuses?.filter(item => item.asset?.mepeo_information).length || 0;
    }, [assetStatuses]);

    const displayedTransactions = useMemo(() => {
        return assetStatuses?.filter(item => {
            const isMcdApproved = item?.asset?.mcd_information?.status === 'Approved';
            const hasMepeoInfo = !!item.asset?.mepeo_information;
            return (isMcdApproved && !hasMepeoInfo) || hasMepeoInfo;
        }) || [];
    }, [assetStatuses]);

    // Handle interactive sorting toggles per header click
    const handleSort = (field: SortField) => {
        if (sortField !== field) {
            setSortField(field);
            setSortDirection('asc');
        } else if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else if (sortDirection === 'desc') {
            setSortField(null);
            setSortDirection(null);
        }
    };

    // Helper render function to switch indicator chevron graphic
    const renderSortIcon = (field: SortField) => {
        if (sortField !== field || !sortDirection) return <ArrowUpDown className="h-3.5 w-3.5 ml-1.5 text-slate-400 opacity-60 group-hover:opacity-100" />;
        return sortDirection === 'asc' 
            ? <ArrowUp className="h-3.5 w-3.5 ml-1.5 text-emerald-600" />
            : <ArrowDown className="h-3.5 w-3.5 ml-1.5 text-emerald-600" />;
    };

    // Processing line: Sorting Table Data
    const processedTransactions = useMemo(() => {
        let pool = displayedTransactions;

        if (sortField && sortDirection) {
            pool = [...pool].sort((a, b) => {
                let valA = '';
                let valB = '';

                switch (sortField) {
                    case 'date':
                        valA = a.created_at || '';
                        valB = b.created_at || '';
                        break;
                    case 'control_number':
                        valA = a.asset?.control_number || '';
                        valB = b.asset?.control_number || '';
                        break;
                    case 'department':
                        valA = a.asset?.end_user_department || '';
                        valB = b.asset?.end_user_department || '';
                        break;
                    case 'submitted_by':
                        valA = a.approver?.name || '';
                        valB = b.approver?.name || '';
                        break;
                }

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return pool;
    }, [sortField, sortDirection, displayedTransactions]);

    // Pagination calculations
    const totalPages = Math.ceil(processedTransactions.length / itemsPerPage) || 1;
    
    const paginatedTransactions = useMemo(() => {
        const normalizedPage = currentPage > totalPages ? 1 : currentPage;
        if (normalizedPage !== currentPage) setCurrentPage(normalizedPage);

        const startIndex = (normalizedPage - 1) * itemsPerPage;
        return processedTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [processedTransactions, currentPage, totalPages, itemsPerPage]);

    // Generate Standard Numeric Pagination Buttons array
    const paginationRange = useMemo(() => {
        const range: number[] = [];
        for (let i = 1; i <= totalPages; i++) {
            range.push(i);
        }
        return range;
    }, [totalPages]);

    return (
        <>
            <Head title="Asid Dashboard" />

            <WelcomeNote />
            
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

                {/* Dashboard Count Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
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
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/80">Evaluated Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight text-emerald-950">{evaluatedTransactionsCount}</h2>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                                <FolderCheck className='h-6 w-6 text-emerald-600' />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Data Table Area */}
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800 select-none">
                                <tr>
                                    <th scope="col" onClick={() => handleSort('control_number')} className="px-4 py-3.5 font-semibold cursor-pointer group hover:bg-slate-200/60 transition-colors">
                                        <div className="flex items-center">Asset Control Number {renderSortIcon('control_number')}</div>
                                    </th>
                                    <th scope="col" onClick={() => handleSort('department')} className="px-4 py-3.5 font-semibold cursor-pointer group hover:bg-slate-200/60 transition-colors">
                                        <div className="flex items-center">Department {renderSortIcon('department')}</div>
                                    </th>
                                    <th scope="col" onClick={() => handleSort('submitted_by')} className="px-4 py-3.5 font-semibold cursor-pointer group hover:bg-slate-200/60 transition-colors">
                                        <div className="flex items-center">Submitted By {renderSortIcon('submitted_by')}</div>
                                    </th>
                                    <th scope="col" onClick={() => handleSort('date')} className="py-3.5 pl-6 pr-3 font-semibold cursor-pointer group hover:bg-slate-200/60 transition-colors">
                                        <div className="flex items-center">Application Date &amp; Time {renderSortIcon('date')}</div>
                                    </th>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status / Action</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 text-gray-600">
                                {paginatedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No active asset disposal data found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTransactions.map((item) => {
                                        const isLogged = !!item.asset?.mepeo_information;
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
                                                <td className="px-4 py-4 font-mono text-base font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.asset?.control_number || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                    <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'Asset Department'}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-50">{item.remarks || '—'}</div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-700">
                                                    {item.approver?.name || 'System Auto'}
                                                </td>
                                                <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                    {formattedDate}
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <Link 
                                                        href={`/mepeo-evaluate/${item.asset_id}`} 
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
                    </div>

                    {/* Integrated Footer Controls */}
                    {processedTransactions.length > 0 && (
                        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 select-none">
                            {/* Left Side: Row Limit Picker & Display Details */}
                            <div className="flex items-center gap-4 text-xs text-slate-500 w-full sm:w-auto justify-between sm:justify-start">
                                <div>
                                    Showing <span className="font-semibold text-slate-700">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                                    <span className="font-semibold text-slate-700">
                                        {Math.min(currentPage * itemsPerPage, processedTransactions.length)}
                                    </span>{' '}
                                    of <span className="font-semibold text-slate-700">{processedTransactions.length}</span> entries
                                </div>
                            </div>

                            {/* Right Side: Standard Numeric Style Pagination Buttons with Zinc Accents */}
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-2">
                                    <span className='text-xs'>Rows</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1.5 outline-hidden focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
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
                                    className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                
                                {paginationRange.map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                                            currentPage === pageNumber
                                                ? 'bg-zinc-800 text-white border-zinc-800 shadow-xs'
                                                : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200 hover:text-zinc-900'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
            </div>
        </>
    );
}

MepeoDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/mepeo-dashboard',
        },
    ],
};