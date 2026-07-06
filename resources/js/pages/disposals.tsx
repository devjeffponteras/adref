import { Head, Link } from '@inertiajs/react';
import { Calendar, Loader, FileWarning, RefreshCw, ArrowUpDown, Tag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { disposals } from '@/routes';

interface Classification {
    id: number;
    name: string;
}

interface Asset {
    id: number;
    control_number: string;
    accountable_personnel: string;
    model: string | null;
    brand_make: string | null;
    serial_plate_id_number: string | null;
    end_user_department: string;
    asset_location: string | null;
    status: string; 
    assessment_report_path: string | null;
    asset_photo_path: string | null;
    created_at: string;
    classification: Classification | null; 
}

interface MyAssetsProps {
    assets: Asset[]; 
}

type FilterType = 'all' | 'pending' | 'ongoing' | 'approved';

export default function Disposals({ assets = [] }: MyAssetsProps) {

    console.log("Inertia Received Assets:", assets);

    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<keyof Asset | 'classification'>('id'); 
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); 
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // --- FILTER STATE ---
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    // --- PAGINATION STATES ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // --- DYNAMIC COUNTERS ---
    const pendingCount = useMemo(() => {
        return assets.filter(asset => asset.status?.includes('Pending')).length;
    }, [assets]);

    const inProgressCount = useMemo(() => {
        return assets.filter(asset => asset.status?.includes('On-going')).length;
    }, [assets]);

    const approvedCount = useMemo(() => {
        return assets.filter(asset => asset.status?.includes('Approved')).length;
    }, [assets]);
    // ------------------------

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.location.reload();
    };

    const toggleFilter = (filter: FilterType) => {
        setActiveFilter(prev => prev === filter ? 'all' : filter);
        setCurrentPage(1); // Reset page on filter shift
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reset page on search typing
    };

    const getStatusStyles = (status: string = '') => {
        if (status.includes('On-going')) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (status.includes('Approved')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (status.includes('Pending')) return 'bg-gray-50 text-gray-700 border-gray-200';
        return 'bg-rose-50 text-rose-700 border-rose-200'; 
    };

    // Filter, sort data completely
    const sortedAndFilteredPool = useMemo(() => {
        let result = [...assets].filter(asset => 
            (asset.serial_plate_id_number?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (asset.model?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (asset.brand_make?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (asset.status?.toLowerCase() || '').includes(search.toLowerCase()) || 
            asset.accountable_personnel.toLowerCase().includes(search.toLowerCase()) ||
            asset.end_user_department.toLowerCase().includes(search.toLowerCase()) ||
            (asset.classification?.name?.toLowerCase() || '').includes(search.toLowerCase())
        );

        if (activeFilter === 'pending') {
            result = result.filter(asset => asset.status?.includes('Pending'));
        } else if (activeFilter === 'ongoing') {
            result = result.filter(asset => asset.status?.includes('On-going'));
        } else if (activeFilter === 'approved') {
            result = result.filter(asset => asset.status?.includes('Approved'));
        }

        result.sort((a, b) => {
            let valA: any;
            let valB: any;

            if (sortField === 'classification') {
                valA = a.classification?.name?.toLowerCase() || '';
                valB = b.classification?.name?.toLowerCase() || '';
            } else {
                valA = a[sortField as keyof Asset];
                valB = b[sortField as keyof Asset];
                
                if (valA === null || valA === undefined) valA = '';
                if (valB === null || valB === undefined) valB = '';

                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [assets, search, sortField, sortDirection, activeFilter]);

    // --- SLICE DATA FOR ACTIVE PAGINATION ---
    const totalItems = sortedAndFilteredPool.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    
    const paginatedAssets = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedAndFilteredPool.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedAndFilteredPool, currentPage, itemsPerPage]);

    const handleSort = (field: keyof Asset | 'classification') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <Head title="Assets for Disposal" />

            <div className="w-full p-6 bg-gray-50/50 min-h-screen">
            
                {/* Action Buttons & Counter Indicators Strip */}
                <div className="mb-6">
                    <div className="relative overflow-hidden bg-gray-100 p-4 rounded-xl shadow border border-zinc-200">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-zinc-100/50 rounded-full blur-xl pointer-events-none" />
                    
                        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                            <div className="flex flex-wrap items-center gap-3">
                                <button 
                                    onClick={() => toggleFilter('pending')}
                                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-150 cursor-pointer shadow-xs ${
                                        activeFilter === 'pending'
                                            ? 'bg-zinc-700 text-white border-zinc-700'
                                            : 'bg-white text-zinc-700 border-zinc-300/60 hover:bg-zinc-50'
                                    }`}
                                >
                                    <Calendar className={`w-4 h-4 ${activeFilter === 'pending' ? 'text-zinc-200' : 'text-zinc-500'}`} />
                                    <span>Upcoming (Pending)</span>
                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full min-w-5 ${
                                        activeFilter === 'pending' ? 'bg-white text-zinc-800' : 'bg-zinc-600 text-white'
                                    }`}>
                                        {pendingCount}
                                    </span>
                                </button>
                                
                                <button 
                                    onClick={() => toggleFilter('ongoing')}
                                    className={`group inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-150 cursor-pointer shadow-xs ${
                                        activeFilter === 'ongoing'
                                            ? 'bg-amber-600 text-white border-amber-600'
                                            : 'bg-amber-50/60 text-amber-800 border-amber-200/70 hover:bg-amber-50'
                                    }`}
                                >
                                    <Loader className={`w-4 h-4 transition-transform duration-500 ease-out group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''} ${
                                        activeFilter === 'ongoing' ? 'text-amber-100' : 'text-amber-600'
                                    }`} />
                                    <span>In Progress</span>
                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full min-w-5 ${
                                        activeFilter === 'ongoing' ? 'bg-white text-amber-900' : 'bg-amber-600 text-white'
                                    }`}>
                                        {inProgressCount}
                                    </span>
                                </button>
                                
                                <button 
                                    onClick={() => toggleFilter('approved')}
                                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-150 cursor-pointer shadow-xs ${
                                        activeFilter === 'approved'
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-emerald-50/60 text-emerald-800 border-emerald-200/70 hover:bg-emerald-50'
                                    }`}
                                >
                                    <FileWarning className={`w-4 h-4 ${activeFilter === 'approved' ? 'text-emerald-100' : 'text-emerald-600'}`} />
                                    <span>Approved Transactions</span>
                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full min-w-5 ${
                                        activeFilter === 'approved' ? 'bg-white text-emerald-900' : 'bg-emerald-600 text-white'
                                    }`}>
                                        {approvedCount}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Asset Transaction Logs Card Layout */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
                    
                    {/* Card Header component wrapper */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 bg-white px-6 py-4">
                        <div className="flex items-center gap-3">
                            <h5 className="text-lg font-bold tracking-tight text-zinc-800">
                                Asset Transaction Logs {activeFilter !== 'all' && <span className="text-sm font-normal text-zinc-400 capitalize">({activeFilter} Filter Applied)</span>}
                            </h5>
                        </div>
                        
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                            {/* Items per Page Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-zinc-500">Rows:</span>
                                <select 
                                    value={itemsPerPage} 
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                    className="text-xs bg-white border border-zinc-300 text-zinc-700 px-2 py-1 rounded-lg focus:outline-none focus:border-zinc-400 cursor-pointer font-semibold"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <button 
                                onClick={handleRefresh}
                                id="btn-refresh-dt" 
                                className="group inline-flex items-center justify-center px-2 py-1.5 rounded-xl border border-zinc-300 text-xs font-medium text-zinc-600 hover:bg-zinc-50 focus:outline-none cursor-pointer" 
                                title="Refresh Table"
                            >
                                <RefreshCw className={`h-4 w-4 text-zinc-500 transition-transform duration-500 ease-out group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Table Layout Wrapper */}
                    <div className="overflow-x-auto w-full">
                        <table id="assetTable" className="w-full min-w-full divide-y divide-zinc-200 text-left align-middle text-sm">
                            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-600">
                                <tr>
                                    <th className="px-6 py-4 w-28">Action</th>
                                    <th onClick={() => handleSort('serial_plate_id_number')} className="px-6 py-4 cursor-pointer hover:bg-zinc-100/80 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Control Number <ArrowUpDown className="h-3 w-3 text-zinc-400" /></div>
                                    </th>
                                    <th onClick={() => handleSort('status')} className="px-6 py-4 cursor-pointer hover:bg-zinc-100/80 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Status <ArrowUpDown className="h-3 w-3 text-zinc-400" /></div>
                                    </th>
                                    <th onClick={() => handleSort('classification')} className="px-6 py-4 cursor-pointer hover:bg-zinc-100/80 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Classification <ArrowUpDown className="h-3 w-3 text-zinc-400" /></div>
                                    </th>
                                    <th onClick={() => handleSort('model')} className="px-6 py-4 cursor-pointer hover:bg-zinc-100/80 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Asset Details <ArrowUpDown className="h-3 w-3 text-zinc-400" /></div>
                                    </th>
                                    <th onClick={() => handleSort('accountable_personnel')} className="px-6 py-4 cursor-pointer hover:bg-zinc-100/80 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Custodian & Office <ArrowUpDown className="h-3 w-3 text-zinc-400" /></div>
                                    </th>
                                    <th onClick={() => handleSort('created_at')} className="px-6 py-4 cursor-pointer hover:bg-zinc-100/80 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Date Added <ArrowUpDown className="h-3 w-3 text-zinc-400" /></div>
                                    </th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-zinc-200 bg-white text-zinc-600">
                                {paginatedAssets.length > 0 ? (
                                    paginatedAssets.map((asset) => (
                                        <tr key={asset.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <Link 
                                                    href={`/assets/${asset.id}/asset-status`} 
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 border border-zinc-300/60 rounded-xl transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </Link>
                                            </td>
                                            <td className="px-6 py-3.5 font-mono font-medium text-zinc-900">
                                                {asset.control_number || <span className="text-zinc-300 italic">No Ctrl Num</span>}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(asset.status)}`}>
                                                    {asset.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-purple-100 text-purple-700 border-purple-300/60">
                                                    <Tag className="h-2.5 w-2.5 text-purple-500" />
                                                    {asset.classification?.name || 'Unclassified'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="font-medium text-zinc-800">
                                                    {asset.brand_make || ''} {asset.model || 'Generic Item'}
                                                </div>
                                                {asset.asset_location && (
                                                    <div className="text-xs text-zinc-400 mt-0.5">Loc: {asset.asset_location}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <div className="text-zinc-900 font-medium">{asset.accountable_personnel}</div>
                                                <div className="text-xs text-zinc-400">{asset.end_user_department}</div>
                                            </td>
                                            <td className="px-6 py-3.5 text-zinc-500 whitespace-nowrap">
                                                {formatDate(asset.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 font-medium">
                                            No matching assets found in the system.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* --- PAGINATION CONTROLS FOOTER BLOCK --- */}
                    <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-6 py-4 select-none">
                        <div className="text-xs font-medium text-zinc-500">
                            Showing <span className="font-semibold text-zinc-700">{totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                            <span className="font-semibold text-zinc-700">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                            <span className="font-semibold text-zinc-700">{totalItems}</span> entries
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all border ${
                                        currentPage === pageNum
                                            ? 'bg-zinc-700 text-white border-zinc-700 shadow-xs'
                                            : 'bg-white text-zinc-600 border-zinc-300/60 hover:bg-zinc-50 cursor-pointer'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

Disposals.layout = {
    breadcrumbs: [
        {
            title: 'Assets for Disposal',
            href: disposals(),
        },
    ],
};