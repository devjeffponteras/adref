import { useForm, Head, usePage, Link } from '@inertiajs/react';
import { 
    Folder, 
    CircleCheck, 
    XIcon, 
    Gavel, 
    FileText, 
    Activity, 
    Users, 
    Calendar,
    Search,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { WelcomeNote } from '@/components/welcome-note';

interface User {
    id: number;
    name: string;
}

interface Approver {
    id: number;
    name: string;
}

interface AccountingInfo {
    id: number;
    asset_id: number;
    book_value: number | string | null;
}

interface ManagerInformation {
    id: number;
    asset_id: number;
    bidding_price: number | string | null;
}

interface BidderRecord {
    id: number;
    asset_id: number;
    bidder_name: string;
    bidding_price: string | number;
    submitted_at: string;
    user_id: number;
    bidder_contact_number: string;
    created_at: string;
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
    Approver?: Approver;
    accounting_information?: AccountingInfo;
    manager_information?: ManagerInformation;
}

interface AssetBiddingData {
    id: number;
    asset_id: number;
    status: string;
    listed_at: string;
    asset?: Asset; 
    biddings?: BidderRecord[];
}

interface BiddingProps {
    assets: Asset[];
    assetOnBidding: AssetBiddingData[]; 
}

type SortableKeys = 'control_number' | 'department' | 'min_bid';
interface SortConfig {
    key: SortableKeys;
    direction: 'asc' | 'desc';
}

export default function BiddingIndex({ assets, assetOnBidding }: BiddingProps) {

    const { flash } = usePage().props as any;

    const approvedAssets = assets || [];
    const activeBiddingList = assetOnBidding || [];

    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [selectedBiddingItem, setSelectedBiddingItem] = useState<AssetBiddingData | null>(null);
    const { post, processing } = useForm({});

    // --- Active Bidding Data Processing States (Search, Sort, Pagination) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleOpenConfirmModal = (asset: Asset) => {
        setSelectedAsset(asset);
    };

    const handleCloseModal = () => {
        setSelectedAsset(null);
    };

    const handleOpenBiddersModal = (item: AssetBiddingData) => {
        setSelectedBiddingItem(item);
    };

    const handleCloseBiddersModal = () => {
        setSelectedBiddingItem(null);
    };

    const handleConfirmPublish = () => {
        if (!selectedAsset) {
            return;
        }

        post(`/admin/bidding/store/${selectedAsset.id}`, {
            onSuccess: () => handleCloseModal(),
        });
    };

    // --- Search, Sort, and Filter Pipeline ---
    const processedBiddingList = useMemo(() => {
        let result = [...activeBiddingList];

        // 1. Search Query Filter
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            result = result.filter(item => {
                const controlNum = item.asset?.control_number?.toLowerCase() || '';
                const brand = item.asset?.brand_make?.toLowerCase() || '';
                const model = item.asset?.model?.toLowerCase() || '';
                const dept = item.asset?.end_user_department?.toLowerCase() || '';
                
                return controlNum.includes(term) || 
                       brand.includes(term) || 
                       model.includes(term) || 
                       dept.includes(term);
            });
        }

        // 2. Sort Logic
        if (sortConfig !== null) {
            result.sort((a, b) => {
                let aValue: string | number = '';
                let bValue: string | number = '';

                if (sortConfig.key === 'control_number') {
                    aValue = (a.asset?.control_number || '').toLowerCase();
                    bValue = (b.asset?.control_number || '').toLowerCase();
                } else if (sortConfig.key === 'department') {
                    aValue = (a.asset?.end_user_department || '').toLowerCase();
                    bValue = (b.asset?.end_user_department || '').toLowerCase();
                } else if (sortConfig.key === 'min_bid') {
                    aValue = Number(a.asset?.manager_information?.bidding_price || 10000);
                    bValue = Number(b.asset?.manager_information?.bidding_price || 10000);
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [activeBiddingList, searchTerm, sortConfig]);

    // 3. Paginate calculations
    const totalPages = Math.max(1, Math.ceil(processedBiddingList.length / itemsPerPage));
    
    const paginatedBiddingList = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedBiddingList.slice(startIndex, startIndex + itemsPerPage);
    }, [processedBiddingList, currentPage, itemsPerPage]);

    const pageNumbers = useMemo(() => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }, [totalPages]);

    // --- Action Handlers ---
    const handleSort = (key: SortableKeys) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const renderSortIcon = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) {
            return (
                <span className="flex flex-col ml-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                    <ChevronUp className="w-3 h-3 -mb-0.5" />
                    <ChevronDown className="w-3 h-3" />
                </span>
            );
        }
        return sortConfig.direction === 'asc' ? 
            <ChevronUp className="w-3.5 h-3.5 ml-1.5 text-blue-700" /> : 
            <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-blue-700" />;
    };

    return (
        <>
            <Head title="Bidding Dashboard" />

            {/* Main Content */}
            <div className="container-fluid p-4 space-y-10"> 

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center shadow-xs animate-fade-in">
                        <CircleCheck className="h-5 w-5 mr-2 text-emerald-600" />
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-center shadow-xs">
                        <XIcon className="h-5 w-5 mr-2 text-red-600" />
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                {/* ========================================== */}
                {/* APPROVED STAGING REGISTRY                  */}
                {/* ========================================== */}
                <div className='hidden'>
                    <div className="mb-4">
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Approved Assets Registry</h1>
                        <p className="text-sm text-gray-500 mt-1">Review approved items and deploy them directly into active bidding cycles.</p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        {approvedAssets.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-emerald-950/5 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-slate-900">
                                            <th className="py-4 px-5">Control No. / Model</th>
                                            <th className="py-4 px-5">Accountable Personnel</th>
                                            <th className="py-4 px-5">Department</th>
                                            <th className="py-4 px-5">Description</th>
                                            <th className="py-4 px-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {approvedAssets.map((item) => (
                                            <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors duration-150 group">
                                                <td className="py-4 px-5">
                                                    <div className="font-mono font-bold text-emerald-800 text-xs bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md inline-block mb-1">
                                                        {item.control_number || 'N/A'}
                                                    </div>
                                                    <div className="font-medium text-gray-900">
                                                        {item.brand_make || ''} {item.model || ''}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5 align-middle">
                                                    <div className="font-medium text-gray-900">{item.accountable_personnel}</div>
                                                    <div className="text-xs text-gray-400">Created by: {item.user?.name || 'System'}</div>
                                                </td>
                                                <td className="py-4 px-5 align-middle">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        {item.end_user_department}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 align-middle max-w-xs">
                                                    <p className="truncate text-gray-500 text-xs" title={item.description || ''}>
                                                        {item.description || <span className="italic text-gray-300">No descriptive brief available</span>}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-5 text-right align-middle">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenConfirmModal(item)}
                                                        className="inline-flex items-center justify-center font-semibold text-xs px-3.5 py-2 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 shadow-xs transition-all duration-150 cursor-pointer focus:outline-hidden"
                                                    >
                                                        <Gavel className="h-3.5 w-3.5 mr-1.5" />
                                                        Publish for Bidding
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-50/50">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
                                    <Folder className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">No Approved Assets Available</h3>
                                <p className="text-xs text-gray-500 max-w-xs mt-1 mx-auto">
                                    There are currently no inventory items holding an approved status ready to pass onto staging.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* ACTIVE BIDDING REGISTRY                    */}
                {/* ========================================== */}

                <div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center">
                                Active Bidding Deployments
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Assets that have been deployed and are currently open to accommodate bidding records.</p>
                        </div>
                        
                        {/* Live Search Workspace Input Box */}
                        <div className="relative w-full md:w-72 shadow-xs">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search active deployments..."
                                className="w-full pl-9 pr-8 py-2 border border-gray-200 bg-white rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden transition-all placeholder-gray-400 text-gray-700 font-medium"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        {paginatedBiddingList.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-blue-950/5 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-blue-950 select-none">
                                                <th 
                                                    onClick={() => handleSort('control_number')}
                                                    className="py-4 px-5 cursor-pointer hover:bg-blue-950/10 group transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        Control No. / Model {renderSortIcon('control_number')}
                                                    </div>
                                                </th>
                                                <th 
                                                    onClick={() => handleSort('department')}
                                                    className="py-4 px-5 cursor-pointer hover:bg-blue-950/10 group transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        Department {renderSortIcon('department')}
                                                    </div>
                                                </th>
                                                <th className="py-4 px-5">Bidding Status</th>
                                                <th 
                                                    onClick={() => handleSort('min_bid')}
                                                    className="py-4 px-5 cursor-pointer hover:bg-blue-950/10 group transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        Minimum Bid {renderSortIcon('min_bid')}
                                                    </div>
                                                </th>
                                                <th className="py-4 px-5">Deployment Date</th>
                                                <th className="py-4 px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                            {paginatedBiddingList.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-150 group">
                                                    <td className="py-4 px-5">
                                                        <div className="font-mono font-bold text-gray-700 text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md inline-block mb-1">
                                                            {item.asset?.control_number || 'N/A'}
                                                        </div>
                                                        <div className="font-medium text-gray-900">
                                                            {item.asset?.brand_make || ''} {item.asset?.model || ''}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-5 align-middle">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                            {item.asset?.end_user_department || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 align-middle">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                                                            <Activity className="h-3 w-3 mr-1 animate-pulse" />
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 align-middle font-medium text-gray-900">
                                                        {item.asset?.manager_information?.bidding_price ? (
                                                            `₱${Number(item.asset.manager_information?.bidding_price).toLocaleString(undefined, { 
                                                                minimumFractionDigits: 2, 
                                                                maximumFractionDigits: 2 
                                                            })}`
                                                        ) : (
                                                            <span>₱10,000</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-5 align-middle text-xs text-gray-500">
                                                        {item.listed_at ? new Date(item.listed_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-5 text-right align-middle">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenBiddersModal(item)}
                                                            className="inline-flex items-center justify-center font-semibold text-xs px-3.5 py-2 rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 shadow-xs transition-all duration-150 cursor-pointer"
                                                        >
                                                            <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                            View Bids
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Toolbar Footer */}
                                <div className="border-t border-gray-100 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
                                    <div className="text-xs text-gray-500">
                                        Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, processedBiddingList.length)}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, processedBiddingList.length)}</span> of <span className="font-semibold">{processedBiddingList.length}</span> deployments
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {/* Dropdown Limit Selection */}
                                        <div className="flex items-center space-x-2 border-r border-gray-200 pr-3">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">Rows:</span>
                                            <select
                                                value={itemsPerPage}
                                                onChange={handleLimitChange}
                                                className="text-xs py-1 px-2 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 font-medium focus:outline-hidden cursor-pointer"
                                            >
                                                <option value={10}>10</option>
                                                <option value={25}>25</option>
                                                <option value={50}>50</option>
                                            </select>
                                        </div>

                                        {/* Pagination Button Control Group */}
                                        <div className="inline-flex space-x-1 items-center">
                                            <button
                                                type="button"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(1)}
                                                className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                                title="First Page"
                                            >
                                                <ChevronsLeft className="w-4 h-4" />
                                            </button>

                                            <button
                                                type="button"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                                title="Previous Page"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            
                                            {pageNumbers.map((page) => (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                                                        currentPage === page
                                                            ? 'bg-blue-950 text-white border-blue-950'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                type="button"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
                                                title="Next Page"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>

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
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-50/50">
                                <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4 border border-gray-200">
                                    <Gavel className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    {searchTerm ? 'No Matching Query Results' : 'No Active Deployments'}
                                </h3>
                                <p className="text-xs text-gray-500 max-w-xs mt-1 mx-auto">
                                    {searchTerm 
                                        ? 'Try checking spelling errors, clearing your criteria rules, or search another keyword.' 
                                        : 'There are currently no items deployed to active auction states.'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Confirmation Modal */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-scale-up">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Gavel className="h-5 w-5" />
                            </div>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Bidding Deployment</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Are you sure you want to open bidding for asset <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 text-xs">{selectedAsset.control_number}</span>?
                            </p>
                            <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600">
                                <span className="font-semibold text-gray-800">Item:</span> {selectedAsset.brand_make} {selectedAsset.model} <br/>
                                <span className="font-semibold text-gray-800">Accountable Personnel:</span> {selectedAsset.accountable_personnel}
                            </div>
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
                                disabled={processing}
                                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center"
                            >
                                {processing ? (
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

            {selectedBiddingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-100 flex flex-col max-h-[85vh] animate-scale-up">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Active Bids Registry</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Asset: <span className="font-mono font-bold text-blue-900 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">{selectedBiddingItem.asset?.control_number || 'N/A'}</span> — {selectedBiddingItem.asset?.brand_make} {selectedBiddingItem.asset?.model}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={handleCloseBiddersModal}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="overflow-y-auto my-4 flex-1 rounded-xl border border-gray-100">
                            {selectedBiddingItem.biddings && selectedBiddingItem.biddings.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-600 sticky top-0 backdrop-blur-md">
                                            <th className="py-3 px-4">Bidder Info</th>
                                            <th className="py-3 px-4">Date/Time Submitted</th>
                                            <th className="py-3 px-4 text-right">Offer Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {[...selectedBiddingItem.biddings]
                                            .sort((a, b) => Number(b.bidding_price) - Number(a.bidding_price))
                                            .map((bidder, index) => (
                                                <tr key={bidder.id} className="hover:bg-slate-50/60 transition-colors duration-150">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center space-x-2">
                                                            {index === 0 && (
                                                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 border border-amber-200 text-amber-800 rounded">
                                                                    Highest
                                                                </span>
                                                            )}
                                                            <span className="font-semibold text-gray-900">{bidder.bidder_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-gray-500 align-middle">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                                            {new Date(bidder.created_at).toLocaleString(undefined, { 
                                                                dateStyle: 'medium', 
                                                                timeStyle: 'short' 
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right align-middle font-mono font-bold text-gray-900">
                                                        ₱{Number(bidder.bidding_price).toLocaleString(undefined, { 
                                                            minimumFractionDigits: 2, 
                                                            maximumFractionDigits: 2 
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-12 bg-gray-50/30">
                                    <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3 border border-gray-200">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900">No Bids Placed Yet</h4>
                                    <p className="text-xs text-gray-500 max-w-xs mt-1 mx-auto">
                                        This asset deployment has not received any bidders under asset ID: {selectedBiddingItem.asset_id}.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleCloseBiddersModal}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
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

BiddingIndex.layout = {
    breadcrumbs: [
        {
            title: 'Bidding',
            href: '/admin/bidding/index',
        },
    ],
};