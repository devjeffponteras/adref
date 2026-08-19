import { useState, useEffect, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { WelcomeNote } from '@/components/welcome-note';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Upload, X, FileText, Image as ImageIcon, CheckCircle2, Save } from 'lucide-react';
import type { AssetStatusData } from '@/types/models';

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

interface UserDashboardProps {
    temporaryAssets: PaginatedData<TemporaryAssetItem>;
    assets?: AssetStatusData[];
    filters: Filters;
}

export default function UserDashboard({ temporaryAssets, assets = [], filters }: UserDashboardProps) {
    const [search, setSearch] = useState<string>(filters?.search || '');
    const [perPage, setPerPage] = useState<number>(filters?.per_page || 10);
    const [sortBy, setSortBy] = useState<string>(filters?.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState<string>(filters?.sort_dir || 'desc');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<number | string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter assets array to only include items deemed as SCRAP -- DUNGAGAN NATO DIRA NEXT TIME OG IF NOT COMPLETED KY KULANG ANG CONDITION
    const scrapAssetsList = useMemo(() => {
        return assets.filter((item: any) => {
            const direction = item?.manager_information?.asset_direction || item?.asset?.manager_information?.asset_direction;
            return direction === 'Deemed as SCRAP';
        });
    }, [assets]);

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

    // Modal Handlers
    const openUpdateModal = (assetId: number | string) => {
        setSelectedAssetId(assetId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedAssetId(null);
        setFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(selectedFile));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssetId || !file) return;

        setIsSubmitting(true);

        router.post(
            `/scrap-update/${selectedAssetId}`,
            {
                attachment: file,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    closeModal();
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    const renderSortIcon = (column: string) => {
        if (sortBy !== column) return <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 opacity-60 group-hover:opacity-100" />;
        return sortDir === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-zinc-800" />
        ) : (
            <ArrowDown className="w-3.5 h-3.5 text-zinc-800" />
        );
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

                    {renderPagination(temporaryAssets)}
                </div>

                {/* SCRAP Assets Table Card */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 shadow-xs overflow-hidden mb-8">
                    <div className="p-4 border-b border-zinc-200 bg-white">
                        <h3 className="text-base font-semibold text-zinc-800">
                            SCRAPS
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Asset Disposal Requests that are deemed as scrap by evaluation results.
                        </p>
                    </div>

                    <div className="overflow-x-auto bg-white">
                        <table className="w-full text-left text-xs text-zinc-700">
                            <thead className="bg-zinc-100/80 text-zinc-600 font-semibold uppercase tracking-wider border-b border-zinc-200">
                                <tr>
                                    <th onClick={() => handleSort('brand_make')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Brand & Model</span>
                                            {renderSortIcon('brand_make')}
                                        </div>
                                    </th>
                                    <th className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Control No.</span>
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('accountable_personnel')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Accountable Personnel</span>
                                            {renderSortIcon('accountable_personnel')}
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('end_user_department')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Department</span>
                                            {renderSortIcon('end_user_department')}
                                        </div>
                                    </th>
                                     <th className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Asset Disposition</span>
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('status')} className="p-3 cursor-pointer group hover:bg-zinc-200/60 transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <span>Action</span>
                                            {renderSortIcon('status')}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {scrapAssetsList.length > 0 ? (
                                    scrapAssetsList.map((item: any, index: number) => {
                                        const asset = item.asset || item;
                                        const targetId = item.asset_id || asset.id;
                                        const isUpdated = item?.asset_scraps?.asset_id;
                                        // console.log(asset?.asset_scraps.asset_id);
                                        return (
                                            <tr key={asset.id ?? item.id ?? index} className="hover:bg-zinc-50/80 transition-colors text-sm">
                                                <td className="p-3 text-zinc-700">
                                                    {asset?.brand_make || asset?.model ? (
                                                        `${asset?.brand_make || ''} ${asset?.model || ''}`.trim()
                                                    ) : (
                                                        <span className="text-zinc-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-zinc-700">{asset?.control_number || 'N/A'}</td>
                                                <td className="p-3 text-zinc-700">{asset?.accountable_personnel || 'N/A'}</td>
                                                <td className="p-3 text-zinc-700">{asset?.end_user_department || 'N/A'}</td>
                                                <td className="p-3 text-zinc-700">{item?.manager_information?.manager_disposition || 'N/A'}</td>
                                                <td className="p-3">
                                                    {isUpdated ? 
                                                        <>
                                                            <button 
                                                                type="button"
                                                                disabled
                                                                className='inline-flex cursor-not-allowed items-center gap-1.5 text-xs font-semibold transition-all px-3 py-1.5 rounded-lg text-amber-100 bg-amber-600 hover:bg-amber-700 border border-amber-200/80 shadow-sm'
                                                            >
                                                                <Save className="w-3.5 h-3.5" />
                                                                UPDATED
                                                            </button>
                                                        </> 
                                                        : 
                                                        <>
                                                            <button 
                                                                type="button"
                                                                onClick={() => openUpdateModal(targetId)}
                                                                className='inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold transition-all px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 shadow-xs'
                                                            >
                                                                <Upload className="w-3.5 h-3.5" />
                                                                UPDATE
                                                            </button>
                                                        </>
                                                    }
                                                    
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center text-zinc-500">
                                            No scrap asset transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Scrap Upload Proof Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs transition-opacity">
                    <div 
                        className="bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-md overflow-hidden transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700">
                                    <Upload className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-zinc-800">
                                    Update Scrap Evidence
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                                    Scrap Evidence Image / Document
                                </label>
                                
                                <div className="border-2 border-dashed border-zinc-200 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors bg-zinc-50/30">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*,.pdf"
                                    />
                                    
                                    {!file ? (
                                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center py-2">
                                            <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                                            <span className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                                                Click to upload attachment
                                            </span>
                                            <span className="text-[11px] text-zinc-400 mt-1">
                                                PNG, JPG, JPEG or PDF (Max 10MB)
                                            </span>
                                        </label>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center space-y-2 py-1">
                                            {previewUrl ? (
                                                <div className="relative w-full h-32 rounded-md overflow-hidden bg-zinc-100 border border-zinc-200">
                                                    <img 
                                                        src={previewUrl} 
                                                        alt="Scrap Preview" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-zinc-700 py-4">
                                                    <FileText className="w-6 h-6 text-emerald-600" />
                                                    <span className="text-xs font-medium truncate max-w-50">
                                                        {file.name}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 pt-1">
                                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                    <CheckCircle2 className="w-3 h-3" /> Ready
                                                </span>
                                                <label 
                                                    htmlFor="file-upload" 
                                                    className="text-[11px] text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
                                                >
                                                    Change file
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-3.5 py-1.5 cursor-pointer text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!file || isSubmitting}
                                    className={`px-3.5 py-1.5 cursor-pointer text-sm font-medium text-white rounded-lg shadow-xs transition-colors ${
                                        !file || isSubmitting
                                            ? 'bg-emerald-500 cursor-not-allowed'
                                            : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                                >
                                    {isSubmitting ? 'Uploading...' : 'Submit Evidence'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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