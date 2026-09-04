import { useState, useMemo, useEffect } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { 
    Folder, 
    FolderCheck, 
    SearchCheckIcon, 
    FileSearch2, 
    FolderOpen, 
    LucideMap, 
    ChevronsUpDown, 
    ChevronUp, 
    ChevronDown, 
    Gavel, 
    XIcon, 
    FolderSync,
    LucideBox,
    PackageOpenIcon,
    MessageCircleWarningIcon,
    CheckCircle,
    CircleCheck,
    Recycle,
    BookmarkCheckIcon,
    EyeIcon,
    FileText,
    ExternalLink,
    Download,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X
 } from 'lucide-react';
import { WelcomeNote } from '@/components/welcome-note';
import type { AssetStatusData, Asset } from '@/types/models';

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

interface Filters {
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_dir?: string;
}

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

interface DashboardProps {
    assetStatuses: AssetStatusData[];
    assets: Asset[];
    assetOnBidding: AssetBiddingData[];
    assetsForDisposal: AssetDisposals[];
    temporaryAssets: PaginatedData<TemporaryAssetItem>;
    filters: Filters;
}

interface AssetBiddingData {
    id: number;
    asset_id: number;
    status: string;
    listed_at: string;
    assets?: Asset; 
}

interface AssetDisposals {
    id: number;
    asset_id: number;
    user_id: number;
    others: string;
}

interface AssetDisposalForm {
    asset_id: number | null;
    others: string;
}

// Reusable Table Footer Component with Per-Page Limit Dropdown and Zinc Number Pagination
function TableFooter({ 
    currentPage, 
    totalPages, 
    onPageChange,
    totalItems,
    currentItemsCount,
    startIndex,
    itemsPerPage,
    onItemsPerPageChange
}: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
    totalItems: number;
    currentItemsCount: number;
    startIndex: number;
    itemsPerPage: number;
    onItemsPerPageChange: (limit: number) => void;
}) {
    if (totalItems === 0) return null;

    // Generate array of page numbers to display
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-100">
            {/* Entries Information & Limit Dropdown */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <div>
                    Showing {startIndex + 1} to {startIndex + currentItemsCount} of {totalItems} entries
                </div>
            </div>
            
            
            <div className='flex flex-row gap-4 items-center'>
                <div className="flex items-center text-xs font-medium text-slate-500 gap-1.5 pe-4">
                    <span>Rows</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="bg-white text-xs border border-slate-200 text-slate-700 rounded-md py-1 px-2 font-medium focus:outline-hidden focus:border-slate-400 cursor-pointer"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                {/* Zinc-styled Number Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        {pageNumbers.map((page) => {
                            const isActive = page === currentPage;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`min-w-8 h-8 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                        isActive 
                                            ? 'bg-zinc-700 text-white' 
                                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
            
        </div>
    );
}

type SortDirection = 'asc' | 'desc' | null;

export default function AsidDashboard({ assetStatuses, assets, assetOnBidding, assetsForDisposal, temporaryAssets, filters }: DashboardProps) {
    const { flash } = usePage().props as any;
    
    const [search, setSearch] = useState<string>(filters?.search || '');
    const [perPage, setPerPage] = useState<number>(filters?.per_page || 10);
    const [sortBy, setSortBy] = useState<string>(filters?.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState<string>(filters?.sort_dir || 'desc');

    const safeStatuses = assetStatuses || [];
    const assetsInfo = assets || [];

    const approvedAssets = assets || [];
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [biddingCategory, setBiddingCategory] = useState('');
    const { setData: setPublishData, post: publishAsset, processing: publishingAsset } = useForm({ category: '' });
    const { data, setData, post, processing, errors, reset } = useForm<AssetDisposalForm>({
        asset_id: null,
        others: '',
    });

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
            '/user-dashboard',
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
        const newLimit = parseInt(e.target.value, 10);
        setPerPage(newLimit);
        fetchData({ per_page: newLimit, page: 1 });
    };

    
    // --- Core Action Handlers ---
    const handleOpenConfirmModal = (asset: Asset) => {
        setSelectedAsset(asset);
        setBiddingCategory('');
    };

    const handleCloseModal = () => {
        setSelectedAsset(null);
        setBiddingCategory('');
    };

    const handleConfirmPublish = () => {
        if (!selectedAsset || !biddingCategory) return;
        publishAsset(`/admin/bidding/store/${selectedAsset.id}`, {
            onSuccess: () => handleCloseModal(),
        });
    };

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<{
        url: string;
        title?: string;
        type?: 'image' | 'pdf' | 'other';
    } | null>(null);

    const openViewModal = (documentPath: string | null, title: string = 'Scrap Document') => {
        if (!documentPath) return;

        const fileUrl = documentPath.startsWith('http') ? documentPath : `/storage/${documentPath}`;
        
        const extension = documentPath.split('.').pop()?.toLowerCase();
        let type: 'image' | 'pdf' | 'other' = 'other';

        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
            type = 'image';
        } else if (extension === 'pdf') {
            type = 'pdf';
        }

        setSelectedDocument({
            url: fileUrl,
            title,
            type,
        });
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedDocument(null);
    };

    // --- Bidding Approved Assets Pagination & Sorting ---
    const [t1PageSize, setT1PageSize] = useState<number>(5);
    const [t1Page, setT1Page] = useState<number>(1);
    const [t1SortField, setT1SortField] = useState<string | null>(null);
    const [t1SortDir, setT1SortDir] = useState<SortDirection>(null);

    const handleT1Sort = (field: string) => {
        if (t1SortField !== field) {
            setT1SortField(field);
            setT1SortDir('asc');
        } else if (t1SortDir === 'asc') {
            setT1SortDir('desc');
        } else if (t1SortDir === 'desc') {
            setT1SortField(null);
            setT1SortDir(null);
        }
        setT1Page(1);
    };

    // --- Dynamic Items Per Page Limits ---
    const [completedLimit, setCompletedLimit] = useState(5);
    const [pendingLimit, setPendingLimit] = useState(5);
    const [allLimit, setAllLimit] = useState(5);
    const [finalLimit, setFinalLimit] = useState(5);
    const [scrapsLimit, setScrapsLimit] = useState(5);

    // --- Pagination Current Page State ---
    const [completedPage, setCompletedPage] = useState(1);
    const [pendingPage, setPendingPage] = useState(1);
    const [allPage, setAllPage] = useState(1);
    const [finalPage, setFinalPage] = useState(1);
    const [scrapsPage, setScrapsPage] = useState(1);

    const assetsToDispose = assetsForDisposal || [];
    
    // --- Core Data Filtering ---
    const completedTransactions = safeStatuses.filter(item => item.asset?.status === 'Completed');
    const pendingTransactions = safeStatuses.filter(item => item.status === 'Pending');

    // const completedTransactions = safeStatuses.filter(item => 
    //     item.status === 'Completed' 
    // );

    // console.log(completedTransactions);
    const historyTransactions = safeStatuses.filter(item => 
        item.asset?.control_number && 
        item.asset.control_number.trim() !== '' && 
        Number(item.seq_no) > 3
    );

    const scrapTransactions = assetsInfo.filter(item => 
        item?.asset_scraps && item.asset_scraps.id !== null
        
    );

    const assetsForBiddingEntry = useMemo(() => {
        return assetsInfo.filter(item => 
            item?.status === 'Completed' &&
            item?.manager_information?.asset_direction === 'For Bidding' &&
            item?.mepeo_information?.waste_classification_id != 13 &&
            !item?.bidding_listing &&
            !item?.asset_disposal
        );
    }, [assetsInfo]);

    const sortedT1Data = useMemo(() => {
        let data = [...assetsForBiddingEntry];
        if (!t1SortField || !t1SortDir) return data;
        return data.sort((a, b) => {
            let valA = a[t1SortField as keyof Asset] ?? '';
            let valB = b[t1SortField as keyof Asset] ?? '';
            return t1SortDir === 'asc' 
                ? String(valA).localeCompare(String(valB)) 
                : String(valB).localeCompare(String(valA));
        });
    }, [assetsForBiddingEntry, t1SortField, t1SortDir]);

    const paginatedT1Data = useMemo(() => {
        const start = (t1Page - 1) * t1PageSize;
        return sortedT1Data.slice(start, start + t1PageSize);
    }, [sortedT1Data, t1Page, t1PageSize]);

    const t1TotalPages = Math.ceil(sortedT1Data.length / t1PageSize) || 1;

    // console.log(assetsInfo.filter(item => 
    //     item?.status === 'Completed' &&
    //     item?.manager_information?.asset_direction === 'For Bidding' &&
    //     item?.mepeo_information?.waste_classification_id != 13
    // ).map(item => ({
    //     id: item.id,
    //     asset_disposal: item.asset_disposal,
    //     disposal_type: typeof item.asset_disposal,
    //     is_array: Array.isArray(item.asset_disposal)
    // })));

    // --- Pagination Logic Helpers ---
    const getPaginatedData = (items: any[], currentPage: number, limit: number) => {
        const startIndex = (currentPage - 1) * limit;
        return items.slice(startIndex, startIndex + limit);
    };

    const getTotalPages = (items: any[], limit: number) => Math.ceil(items.length / limit) || 1;

    // Helper to safely reset page position when limit dropdown changes
    const handleLimitChange = (setLimit: (l: number) => void, setPage: (p: number) => void) => (newLimit: number) => {
        setLimit(newLimit);
        setPage(1); 
    };

    // Helper dynamically injecting sorted arrow states
    const renderSortIcon = (field: string, currentField: string | null, currentDir: SortDirection) => {
        if (currentField !== field || !currentDir) return <ChevronsUpDown className="h-3 w-3 text-gray-400 ml-1.5 inline-block shrink-0" />;
        return currentDir === 'asc' 
            ? <ChevronUp className="h-3 w-3 text-gray-800 ml-1.5 inline-block shrink-0" /> 
            : <ChevronDown className="h-3 w-3 text-gray-800 ml-1.5 inline-block shrink-0" />;
    };

    // version 2 ta ky para goods
    const renderSortIcon2 = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 opacity-60 group-hover:opacity-100" />;
        return sortDir === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-zinc-800" />
        ) : (
            <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
        );
    };

    // Sa ubos kay modal popup of asset disposal button
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

    const openDisposeModal = (assetId: number) => {
        setSelectedAssetId(assetId);
        setData('asset_id', assetId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmitModal = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAssetId) return;

        post(`/dispose/${selectedAssetId}/action`, {
            onSuccess: () => closeModal(),
        });
    };

    const renderPagination = (paginatedData: PaginatedData<any>) => {
        if (!paginatedData) return null;

        return (
            <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
                <div>
                    Showing <span className="font-semibold text-zinc-800">{paginatedData.from || 0}</span> to{' '}
                    <span className="font-semibold text-zinc-800">{paginatedData.to || 0}</span> of{' '}
                    <span className="font-semibold text-zinc-800">{paginatedData.total || 0}</span> results
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

                    {paginatedData.links && paginatedData.links.length > 3 && (
                        <div className="flex items-center gap-1">
                            {paginatedData.links.map((link, idx) => (
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
        );
    };

    return (
        <>
            <Head title="Asid Dashboard" />

            <WelcomeNote />

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
            
            <div className="container-fluid p-4">
                {/* Metric Cards Row */}
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

                    <a 
                        href="#evaluation_of_disposition"
                        className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-cyan-100 bg-linear-to-br from-cyan-50 to-cyan-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-cyan-500/5"
                    >
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-cyan-200/20 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700/80">Evaluation of Disposition (Final Stages)</p>
                            <h2 className="font-extrabold text-3xl tracking-tight text-cyan-950">{historyTransactions.length}</h2>
                        </div>
                        <div className="rounded-xl bg-cyan-50 p-3 border border-cyan-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-cyan-100">
                            <FolderCheck className='h-6 w-6 text-cyan-600' />
                        </div>
                        </div>
                    </a>
                    <a 
                        href="#all_request_transactions" className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-emerald-50/50 p-5 text-slate-800 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:shadow-emerald-500/5">
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-200/20 blur-xl transition-all group-hover:scale-150" />
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/80">All Transactions</p>
                                <h2 className="font-extrabold text-3xl tracking-tight text-emerald-950">{safeStatuses.length}</h2>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200/60 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                                <FolderOpen className='h-6 w-6 text-emerald-600' />
                            </div>
                        </div>
                    </a>
                </div>

                <div className="w-full inline-flex gap-4">

                    {/* APPROVED STAGING REGISTRY */}
                    <div className="mt-8 w-1/2">
                        <div className="my-4">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Approved Assets Registry for Bidding</h1>
                            <p className="text-sm text-gray-500 mt-1">Review approved items and deploy them directly into active bidding cycles.</p>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">
                            {assetsForBiddingEntry.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto flex flex-col justify-between max-h-127.25">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-emerald-950/5 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-slate-900">
                                                    <th onClick={() => handleT1Sort('control_number')} className="py-4 px-5 cursor-pointer select-none hover:bg-emerald-950/10">
                                                        <span className="flex items-center">Control No. / Model {renderSortIcon('control_number', t1SortField, t1SortDir)}</span>
                                                    </th>
                                                    <th onClick={() => handleT1Sort('accountable_personnel')} className="py-4 px-5 cursor-pointer select-none hover:bg-emerald-950/10">
                                                        <span className="flex items-center">Accountable Personnel {renderSortIcon('accountable_personnel', t1SortField, t1SortDir)}</span>
                                                    </th>
                                                    <th onClick={() => handleT1Sort('end_user_department')} className="py-4 px-5 cursor-pointer select-none hover:bg-emerald-950/10">
                                                        <span className="flex items-center">Department {renderSortIcon('end_user_department', t1SortField, t1SortDir)}</span>
                                                    </th>
                                                    {/* <th className="py-4 px-5">Description</th> */}
                                                    <th className="py-4 px-5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                                {paginatedT1Data.map((item) => (
                                                    <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors duration-150 group">
                                                        <td className="py-4 px-5">
                                                            <div className="font-mono font-bold text-emerald-800 text-xs bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md inline-block mb-1">
                                                                {item.control_number || 'N/A'}
                                                            </div>
                                                            <div className="font-medium text-gray-900 text-xs">
                                                                {item.brand_make || ''} {item.model || ''}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5 align-middle">
                                                            <div className="font-medium text-gray-900 text-xs">{item.accountable_personnel}</div>
                                                            <div className="text-xs text-gray-400">Created by: {item.user?.name || 'System'}</div>
                                                        </td>
                                                        <td className="py-4 px-5 align-middle">
                                                            <span className="text-xs font-medium">
                                                                {item.end_user_department === 'INFORMATION COMMUNICATIONS TECHNOLOGY'? 'ICT' : item.end_user_department}
                                                            </span>
                                                        </td>
                                                        {/* <td className="py-4 px-5 align-middle max-w-xs">
                                                            <p className="truncate text-gray-500 text-sm" title={item.description || ''}>
                                                                {item.description || <span className="italic text-gray-300">No descriptive brief available</span>}
                                                            </p>
                                                        </td> */}
                                                        <td className="py-4 px-5 text-right align-middle">
                                                            {item?.bidding_listing ? 
                                                            <button
                                                                type="button"
                                                                disabled
                                                                className="inline-flex items-center justify-center font-semibold text-xs px-3.5 py-2 rounded-lg text-white bg-amber-700 hover:bg-amber-800 active:bg-amber-900 shadow-xs transition-all duration-150 cursor-not-allowed focus:outline-hidden"
                                                            >
                                                                <BookmarkCheckIcon className="h-3.5 w-3.5 mr-1.5" />
                                                                Published
                                                            </button>
                                                            :
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenConfirmModal(item)}
                                                                className="inline-flex items-center justify-center font-semibold text-xs px-3.5 py-2 rounded-lg text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 shadow-xs transition-all duration-150 cursor-pointer focus:outline-hidden"
                                                            >
                                                                <Gavel className="h-3.5 w-3.5 mr-1.5" />
                                                                Publish
                                                            </button>
                                                            }
                                                            
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Footer row pagination control unit */}
                                    <div className="bg-zinc-50 border-t border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>Showing {Math.min(sortedT1Data.length, (t1Page - 1) * t1PageSize + 1)}–{Math.min(sortedT1Data.length, t1Page * t1PageSize)} of {sortedT1Data.length} records</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="flex items-center gap-1.5 pe-5">
                                                <span className='text-xs'>Rows:</span>
                                                <select 
                                                    value={t1PageSize} 
                                                    onChange={(e) => { setT1PageSize(Number(e.target.value)); setT1Page(1); }}
                                                    className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg p-1 pr-5 focus:outline-hidden focus:border-zinc-500 cursor-pointer"
                                                >
                                                    {[5, 10, 25, 50].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                                                </select>
                                            </div>
                                            {Array.from({ length: t1TotalPages }).map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setT1Page(idx + 1)}
                                                    className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-medium border transition-colors cursor-pointer ${t1Page === idx + 1 ? 'bg-zinc-700 border-zinc-800 text-white shadow-xs' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'}`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-50/50">
                                    <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4 border border-purple-100">
                                        <FolderSync className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900">No Approved Assets Available for Bidding</h3>
                                    <p className="text-xs text-gray-500 max-w-sm mt-1 mx-auto">There are currently no asset items holding for bidding cycle.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ========================================================
                    Pending Transactions Table 
                    ======================================================== */}
                    <div className="mt-8 rounded-2xl border border-slate-100 shadow-sm bg-white w-1/2 flex flex-col justify-between max-h-148.25 overflow-auto">
                        <div className="overflow-x-auto">
                            <h3 className='font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-gray-50 border-b border-gray-200 flex gap-2 items-center'><Folder className='w-5 h-5 text-amber-600' /> Pending Transactions</h3>
                            <table className="w-full min-w-full divide-y divide-slate-100/40 text-left align-middle text-sm">
                                <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                        <th scope="col" className="px-4 py-3.5 font-semibold">Applicant</th>
                                        {/* <th scope="col" className="px-4 py-3.5 font-semibold">Department</th> */}
                                        <th scope="col" className="px-4 py-3.5 font-semibold">Brand & Model</th>
                                        <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                
                                <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                    {pendingTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-gray-400 font-medium bg-white">
                                                No pending asset evaluations waiting.
                                            </td>
                                        </tr>
                                    ) : (
                                        getPaginatedData(pendingTransactions, pendingPage, pendingLimit).map((item) => {
                                            const formattedDate = item.created_at 
                                                ? new Date(item.created_at).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                }) : 'No Date Recorded';

                                            return (
                                                <tr key={item.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                                    <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors text-xs">
                                                        {formattedDate}
                                                    </td>
                                                    <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent capitalize">
                                                        {item.asset?.user?.name || 'N/A'}
                                                    </td>
                                                    {/* <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                                                        <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'The Users Department'}</div>
                                                    </td> */}
                                                    <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700 text-xs">
                                                        <div className="font-medium text-gray-800">{item.asset?.brand_make || 'Asset Brand / Make'} {item.asset?.model || 'Asset Model'}</div>
                                                    </td>
                                                    <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                        <Link 
                                                            href={`/asid-view/${item.asset_id}`} 
                                                            className="inline-flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-700 font-medium transition-colors outline-1 outline-emerald-300 px-3 py-2 rounded hover:bg-emerald-50"
                                                        >
                                                            <SearchCheckIcon className='w-4 h-4' /> View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <TableFooter 
                            currentPage={pendingPage}
                            totalPages={getTotalPages(pendingTransactions, pendingLimit)}
                            onPageChange={setPendingPage}
                            totalItems={pendingTransactions.length}
                            currentItemsCount={getPaginatedData(pendingTransactions, pendingPage, pendingLimit).length}
                            startIndex={(pendingPage - 1) * pendingLimit}
                            itemsPerPage={pendingLimit}
                            onItemsPerPageChange={handleLimitChange(setPendingLimit, setPendingPage)}
                        />
                    </div>

                </div>

                <hr className="border-gray-100 my-4" />

                {/* ========================================================
                    Completed Transactions Table 
                ======================================================== */}
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <h3 className='font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-gray-50 border-b border-gray-200 flex gap-2 items-center'>
                            <LucideBox className='w-5 h-5 text-emerald-600' /> Asset Disposal
                        </h3>
                        <table className="w-full min-w-full divide-y divide-slate-100/40 text-left align-middle text-sm">
                            <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Accountable Personnel</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Brand & Model</th>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {completedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No completed asset requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    getPaginatedData(completedTransactions, completedPage, completedLimit).map((item) => {
                                        const formattedDate = item.asset?.created_at 
                                            ? new Date(item.asset?.created_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            }) : 'No Date Recorded';

                                        return (
                                            <tr key={item.asset?.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                                <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent capitalize">
                                                    {item.asset?.accountable_personnel || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                                                    <div className="font-medium text-gray-800">{ (item.asset?.end_user_department === 'INFORMATION COMMUNICATIONS TECHNOLOGY'? 'ICT' : item.asset?.end_user_department) || 'The Users Department'}</div>
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                                                    <div className="font-medium text-gray-800">{item.asset?.brand_make || 'Asset Brand / Make'} {item.asset?.model || 'Asset Model'}</div>
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    { (item.asset?.asset_disposal) ? 
                                                        <button 
                                                            type="button"
                                                            disabled
                                                            id={`asset_dispose_${item.asset?.id}`}
                                                            className="shadow inline-flex items-center gap-1.5 cursor-not-allowed text-sm text-white hover:text-amber-200 bg-amber-700 font-medium transition-colors outline-1 px-3 py-2 rounded-lg hover:bg-amber-800"
                                                        >
                                                            <Recycle className="w-5 h-5" /> 
                                                            Asset Disposed
                                                        </button>
                                                    : 
                                                        <button 
                                                            type="button"
                                                            id={`asset_dispose_${item.asset?.id}`}
                                                            onClick={() => openDisposeModal(item.asset?.id)}
                                                            className="shadow inline-flex items-center gap-1.5 cursor-pointer text-sm text-white hover:text-emerald-200 bg-emerald-700 font-medium transition-colors outline-1 px-3 py-2 rounded-lg hover:bg-emerald-800"
                                                        >
                                                            <PackageOpenIcon className="w-5 h-5" /> 
                                                            Asset Disposal Completed
                                                        </button>
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <TableFooter 
                        currentPage={completedPage}
                        totalPages={getTotalPages(completedTransactions, completedLimit)}
                        onPageChange={setCompletedPage}
                        totalItems={completedTransactions.length}
                        currentItemsCount={getPaginatedData(completedTransactions, completedPage, completedLimit).length}
                        startIndex={(completedPage - 1) * completedLimit}
                        itemsPerPage={completedLimit}
                        onItemsPerPageChange={handleLimitChange(setCompletedLimit, setCompletedPage)}
                    />
                </div>

                <hr className="border-gray-100 my-4" />

                {/* ========================================================
                     Final Stages Table Section
                   ======================================================== */}
                <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <h3 id='evaluation_of_disposition' className='gap-2 font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-slate-50 border-b border-slate-200 flex items-center'><FolderCheck className='w-5 h-5 text-cyan-600' /> Evaluation of DISPOSITION</h3>
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                            <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-800">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Brand & Model</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Department / Latest Remarks</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Created by</th>
                                    <th scope="col" className="px-4 py-3.5 font-semibold">Current Step</th>
                                    <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status / Action</th>
                                </tr>
                            </thead>
                            
                            <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                {historyTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium bg-white">
                                            No active asset disposal data found.
                                        </td>
                                    </tr>
                                ) : (
                                    getPaginatedData(historyTransactions, finalPage, finalLimit).map((item) => {
                                        const formattedDate = item.created_at 
                                            ? new Date(item.created_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            }) : 'No Date Recorded';

                                        return (
                                            <tr key={item.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                                <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.asset?.control_number}
                                                </td>
                                                <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                    {item.asset?.brand_make} 
                                                    {item.asset?.model}
                                                </td>
                                                <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                    <div className="font-medium text-gray-800">{item.asset?.end_user_department || 'Asset Department'}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-50">{item.remarks || '—'}</div>
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-700">
                                                    {item.approver?.name || 'System Auto'}
                                                </td>
                                                <td className="px-4 py-4 text-xs font-semibold text-emerald-800">
                                                    Step {item.seq_no}
                                                </td>
                                                <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                    <Link 
                                                        href={`/asid-evaluate/${item.asset_id}`} 
                                                        className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors outline-1 px-3 py-2 rounded ${
                                                        item.asset.status === 'Completed'
                                                            ? 'text-zinc-600 hover:text-zinc-700 outline-zinc-300 hover:bg-zinc-50'
                                                            : 'text-amber-500 hover:text-amber-700 outline-amber-300 hover:bg-amber-50'
                                                        }`}
                                                    >
                                                        {item.asset.status === 'Completed' ? 'View Logs' : 'Evaluate'}
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <TableFooter 
                        currentPage={finalPage}
                        totalPages={getTotalPages(historyTransactions, finalLimit)}
                        onPageChange={setFinalPage}
                        totalItems={historyTransactions.length}
                        currentItemsCount={getPaginatedData(historyTransactions, finalPage, finalLimit).length}
                        startIndex={(finalPage - 1) * finalLimit}
                        itemsPerPage={finalLimit}
                        onItemsPerPageChange={handleLimitChange(setFinalLimit, setFinalPage)}
                    />
                </div>

                <hr className="border-gray-100" />

                <div className="w-full inline-flex gap-4">

                    {/* ========================================================
                        All Transactions Table Section
                    ======================================================== */}
                    <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white w-1/2">
                        <div className="overflow-x-auto">
                            <h3 className='font-bold text-sm px-6 py-4 text-slate-900 uppercase mb-0 bg-gray-50 border-b border-gray-200 flex gap-2 items-center'><FolderOpen className='w-5 h-5 text-emerald-600' />All Transactions</h3>
                            <table id='all_request_transactions' className="w-full min-w-full divide-y divide-slate-100 text-left align-middle text-sm">
                                <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-800">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-3 pr-6 font-semibold text-center">Status</th>
                                        <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                        <th scope="col" className="px-4 py-3.5 font-semibold">Brand & Model</th>
                                        {/* <th scope="col" className="px-4 py-3.5 font-semibold">Department / Latest Remarks</th> */}
                                        {/* <th scope="col" className="px-4 py-3.5 font-semibold">Created By</th> */}
                                        <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                                        <th scope="col" className="px-4 py-3.5 font-semibold">Current Step</th>
                                    </tr>
                                </thead>
                                
                                <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                    {safeStatuses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-gray-400 font-medium bg-white">
                                                No active asset disposal data found.
                                            </td>
                                        </tr>
                                    ) : (
                                        getPaginatedData(safeStatuses, allPage, allLimit).map((item) => {
                                            const formattedDate = item.created_at 
                                                ? new Date(item.created_at).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                }) : 'No Date Recorded';

                                            return (
                                                <tr key={item.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                                    <td className="py-4 pr-6 text-center whitespace-nowrap">
                                                        <Link 
                                                            href={`/assets/${item.asset_id}/asset-status`} 
                                                            className="inline-flex items-center gap-1.5 text-sm text-white font-medium transition-colors outline-1 px-2 py-2 rounded-full shadow bg-linear-to-br from-cyan-700 to-[#01a78b]"
                                                            title='View Status'
                                                        >
                                                            <FileSearch2 className='w-5 h-5'  />
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-4 font-mono font-semibold text-xs text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                        {item.asset?.control_number || '—'}
                                                    </td>
                                                    <td className="px-4 py-4 text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                        {item.asset?.brand_make || ''} {item.asset?.model || ''}
                                                    </td>
                                                    {/* <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                        <div className="font-medium text-gray-800 text-sm">{item.asset?.end_user_department || 'Asset Department'}</div>
                                                        <div className="text-xs text-gray-400 truncate max-w-50">{item.remarks || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-4 font-medium text-gray-700">
                                                        {item.approver?.name || 'System Auto'}
                                                    </td> */}
                                                    <td className="py-4 pl-6 pr-3 font-medium text-xs text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                        {formattedDate}
                                                    </td>
                                                    <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                        Stage {item.seq_no}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <TableFooter 
                            currentPage={allPage}
                            totalPages={getTotalPages(safeStatuses, allLimit)}
                            onPageChange={setAllPage}
                            totalItems={safeStatuses.length}
                            currentItemsCount={getPaginatedData(safeStatuses, allPage, allLimit).length}
                            startIndex={(allPage - 1) * allLimit}
                            itemsPerPage={allLimit}
                            onItemsPerPageChange={handleLimitChange(setAllLimit, setAllPage)}
                        />
                    </div>

                    {/* ========================================================
                        SCRAPS Table Section
                    ======================================================== */}
                    <div className="my-6 overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white w-1/2 flex flex-col justify-between">
                        <div className="overflow-x-auto">
                            <h3 className='gap-2 font-bold text-sm px-6 py-4 text-gray-900 uppercase mb-0 bg-gray-50 border-b border-slate-200 flex items-center'><LucideMap className='w-5 h-5 text-indigo-600' /> DEEMED AS SCRAPS</h3>
                            <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                                <thead className="bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-800">
                                    <tr>
                                        {/* <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th> */}
                                        <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                                        <th scope="col" className="px-4 py-3.5 font-semibold">Accountable Personnel</th>
                                        <th scope="col" className="px-4 py-3.5 font-semibold">Brand & Model</th>
                                        <th scope="col" className="px-4 py-3.5 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                
                                <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                                    {scrapTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-gray-400 font-medium bg-white">
                                                No SCRAP asset/s data found.
                                            </td>
                                        </tr>
                                    ) : (
                                        getPaginatedData(scrapTransactions, scrapsPage, scrapsLimit).map((item) => {
                                            const formattedDate = item.created_at 
                                                ? new Date(item.created_at).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                }) : 'No Date Recorded';

                                            return (
                                                <tr key={item.id} className="group hover:bg-emerald-50/30 transition-all duration-150">
                                                    {/* <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                                        {formattedDate}
                                                    </td> */}
                                                    <td className="px-4 py-4 font-mono text-sm font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                                        {item.control_number}
                                                    </td>
                                                    <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700" title={item.remarks || ''}>
                                                        <div className="font-medium text-gray-800">{item.accountable_personnel || 'Asset Department'}</div>
                                                        <div className="text-xs text-gray-400 truncate max-w-50">{item.reasons_for_disposal || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-4 font-medium text-gray-700">
                                                        {item.brand_make || 'Item Brand'} {item.model || 'Item Model'}
                                                    </td>
                                                    <td className="p-3">
                                                        <button 
                                                            type="button"
                                                            onClick={() => {
                                                                const scrap = Array.isArray(item?.asset_scraps) ? item?.asset_scraps[0] : item?.asset_scraps;
                                                                openViewModal(scrap?.doc_proofs, `Document - ${item?.control_number || 'Scrap Asset'}`);
                                                            }}
                                                            disabled={! (Array.isArray(item?.asset_scraps) ? item?.asset_scraps[0]?.doc_proofs : item?.asset_scraps?.doc_proofs)}
                                                            className={`inline-flex text-nowrap cursor-pointer items-center gap-1.5 text-xs font-semibold transition-all px-3 py-1.5 rounded-lg border shadow-xs ${
                                                                (Array.isArray(item?.asset_scraps) ? item?.asset_scraps[0]?.doc_proofs : item?.asset_scraps?.doc_proofs)
                                                                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200/80'
                                                                    : 'text-zinc-400 bg-zinc-100 border-zinc-200 cursor-not-allowed opacity-60'
                                                            }`}
                                                        >
                                                            <EyeIcon className="w-3.5 h-3.5" />
                                                            View Document
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <TableFooter 
                            currentPage={scrapsPage}
                            totalPages={getTotalPages(scrapTransactions, scrapsLimit)}
                            onPageChange={setScrapsPage}
                            totalItems={scrapTransactions.length}
                            currentItemsCount={getPaginatedData(scrapTransactions, scrapsPage, scrapsLimit).length}
                            startIndex={(scrapsPage - 1) * scrapsLimit}
                            itemsPerPage={scrapsLimit}
                            onItemsPerPageChange={handleLimitChange(setScrapsLimit, setScrapsPage)}
                        />
                    </div> 

                </div>
                
                <hr className="border-gray-100 mt-4 mb-8" />

                {/* ========================================================
                    Temporary Asset Applications Section
                ======================================================== */}
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
                                            {renderSortIcon2('refno')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('transid')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Trans ID</span>
                                            {renderSortIcon2('transid')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('accountable_personnel')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Accountable Personnel</span>
                                            {renderSortIcon2('accountable_personnel')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('brand_make')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Brand & Model</span>
                                            {renderSortIcon2('brand_make')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('end_user_department')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Department</span>
                                            {renderSortIcon2('end_user_department')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('status')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Status</span>
                                            {renderSortIcon2('status')}
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

                    {renderPagination(temporaryAssets)}
                </div>
                
            </div>

            {/* Confirmation Modal */}
            {selectedAsset && (
                <div className="bidding-publish-confirm-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-2xl max-h-[90vh] w-full p-6 shadow-xl border border-gray-100 animate-scale-up overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="inline-flex items-center gap-2">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                    <Gavel className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Bidding Deployment</h3>
                            </div>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            {(() => {
                                const firstPhoto = selectedAsset.asset_photos?.[0];
                                const photoPath = typeof firstPhoto === 'string'
                                    ? firstPhoto
                                    : firstPhoto?.file_path || firstPhoto?.path || firstPhoto?.url;
                                const photoUrl = photoPath
                                    ? (photoPath.startsWith('http') ? photoPath : `/storage/${photoPath.replace(/^\//, '')}`)
                                    : null;

                                return photoUrl ? (
                                    <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                        <img
                                            src={photoUrl}
                                            alt={`Asset ${selectedAsset.control_number || 'photo'}`}
                                            className="h-48 w-full object-contain"
                                        />
                                    </div>
                                ) : null;
                            })()}

                            <p className="text-sm text-gray-500 mt-2">
                                Are you sure you want to open bidding for asset <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-xs">{selectedAsset.control_number}</span>?
                            </p>
                            <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-900">Asset Details</h4>
                                <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-xs text-gray-600 sm:grid-cols-2">
                                    <div><span className="font-semibold text-gray-800">Asset Control Number:</span> {selectedAsset.control_number || 'N/A'}</div>
                                    <div><span className="font-semibold text-gray-800">Item Description:</span> {selectedAsset.brand_make || ''} {selectedAsset.model || 'N/A'}</div>
                                    <div><span className="font-semibold text-gray-800">Bidding Cycle:</span> {selectedAsset.manager_information?.bidding_cycle ?? '1'}</div>
                                    <div><span className="font-semibold text-gray-800">Minimum Bid:</span> ₱{Number(selectedAsset.manager_information?.bidding_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                    <div><span className="font-semibold text-gray-800">Accountable Personnel:</span> {selectedAsset.accountable_personnel || 'N/A'}</div>
                                    <div><span className="font-semibold text-gray-800">Department:</span> {selectedAsset.end_user_department || 'N/A'}</div>
                                    <div className="sm:col-span-2"><span className="font-semibold text-gray-800">Description:</span> {selectedAsset.description || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                                <label htmlFor="bidding-category" className="mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-900">
                                    Bidding Category
                                </label>
                                <select
                                    id="bidding-category"
                                    value={biddingCategory}
                                    onChange={(event) => {
                                        setBiddingCategory(event.target.value);
                                        setPublishData('category', event.target.value);
                                    }}
                                    className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-200"
                                >
                                    <option value="" disabled>Select bidding category</option>
                                    <option value="PMC MMPRC EMPLOYEES">Bidding for PMC and MMPRC Employees</option>
                                    <option value="EVERYONE OUTSIDERS CONTRACTORS">Bidding for Everyone Including Outsiders and Contractors</option>
                                    <option value="PGECC">Bidding by Philsaga Group Employees Credit Cooperative (PGECC)</option>
                                    <option value="ALL EMPLOYEES OUTSIDERS CONTRACTORS">Open to All Employees Including Outsiders and Contractors</option>
                                </select>
                            </div>

                            {selectedAsset.bids && selectedAsset.bids.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Submitted Bid Entries</h4>
                                    {selectedAsset.bids.map((bid) => (
                                        <div key={bid.id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-gray-600">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                                                <div><span className="font-semibold text-gray-800">Bidder:</span> {bid.bidder_name || 'N/A'}</div>
                                                <div><span className="font-semibold text-gray-800">Contact:</span> {bid.bidder_contact_number || 'N/A'}</div>
                                                <div><span className="font-semibold text-gray-800">Classification:</span> {bid.bidder_classification || 'N/A'}</div>
                                                <div><span className="font-semibold text-gray-800">Department:</span> {bid.department || 'N/A'}</div>
                                                <div><span className="font-semibold text-gray-800">Date Hired:</span> {bid.date_hired || 'N/A'}</div>
                                                <div><span className="font-semibold text-gray-800">Bidding Cycle:</span> {bid.bidding_cycle || '1'}</div>
                                                <div><span className="font-semibold text-gray-800">Offer:</span> ₱{Number(bid.bidding_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                                <div><span className="font-semibold text-gray-800">Reference No.:</span> {bid.reference_number || 'N/A'}</div>
                                                <div className="sm:col-span-2"><span className="font-semibold text-gray-800">Remarks:</span> {bid.remarks || 'N/A'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmPublish}
                                disabled={publishingAsset || !biddingCategory}
                                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center"
                            >
                                {publishingAsset ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                                        Publishing...
                                    </>
                                ) : (
                                    'Confirm & Publish'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Background Overlay (Clickable to close) */}
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                        aria-hidden="true" 
                        onClick={closeModal} 
                    />

                    {/* Modern Modal Card */}
                    <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl shadow-slate-200/50 transform transition-all p-8 border border-slate-100">
                        
                        {/* Header Section */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight inline-flex gap-1">
                                <MessageCircleWarningIcon className='w-8 h-8 text-amber-600' />
                                Confirm Asset Disposal
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                You are about to record this asset as disposed. Please review your action.
                            </p>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmitModal} className="space-y-6">
                            {/* Input Field Group */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-800">
                                    Disposal Notes / Additional Details <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                
                                <textarea
                                    value={data.others}
                                    onChange={(e) => setData('others', e.target.value)}
                                    rows={4}
                                    placeholder="Enter any necessary details or reasons for disposal..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm 
                                            text-slate-950 placeholder:text-slate-400
                                            focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 
                                            transition-all duration-150 resize-none"
                                />
                                
                                {errors.others && (
                                    <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {errors.others}
                                    </p>
                                )}
                            </div>

                            {/* Sticky Action Footer */}
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-slate-100">
                                {/* Secondary 'Cancel' Action */}
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 
                                            bg-white hover:bg-slate-50 rounded-xl border border-slate-200
                                            transition-all duration-150 active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
                                >   
                                    <XIcon className='w-5 h-5' />
                                    Cancel, Back to List
                                </button>

                                {/* Primary 'Confirm' Action */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 
                                            text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 
                                            rounded-xl shadow-sm transition-all duration-150
                                            active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <CheckCircle className='w-5 h-5' />
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Recording...
                                        </>
                                    ) : (
                                        'Record Asset Disposal'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Document Modal */}
            {isViewModalOpen && selectedDocument && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-xs transition-opacity">
                    <div 
                        className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
                            <div className="flex items-center gap-2 truncate">
                                <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-zinc-800 truncate">
                                    {selectedDocument.title}
                                </h3>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Download / Open in New Tab Button */}
                                <a
                                    href={selectedDocument.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-300 px-2.5 py-1.5 rounded transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Open in new tab</span>
                                </a> 
                                
                                <button
                                    type="button"
                                    onClick={closeViewModal}
                                    className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-200/60 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body / Viewer */}
                        <div className="flex-1 bg-zinc-100/60 p-4 flex items-center justify-center overflow-auto relative">
                            {selectedDocument.type === 'image' && (
                                <div className="max-w-full max-h-full flex items-center justify-center">
                                    <img
                                        src={selectedDocument.url}
                                        alt="Uploaded Proof"
                                        className="max-w-full max-h-[70vh] object-contain rounded-lg border border-zinc-200 shadow-xs bg-white"
                                    />
                                </div>
                            )}

                            {selectedDocument.type === 'pdf' && (
                                <iframe
                                    src={selectedDocument.url}
                                    title="Document Viewer"
                                    className="w-full h-full rounded-lg border border-zinc-200 bg-white shadow-xs"
                                />
                            )}

                            {selectedDocument.type === 'other' && (
                                <div className="text-center p-8 bg-white rounded-xl border border-zinc-200 shadow-xs max-w-sm">
                                    <FileText className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                                    <p className="text-xs text-zinc-600 mb-4">
                                        Preview not directly supported for this file type.
                                    </p>
                                    <a
                                        href={selectedDocument.url}
                                        download
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download File
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={closeViewModal}
                                className="px-4 py-1.5 text-sm cursor-pointer font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

AsidDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/asid-dashboard',
        },
    ],
};