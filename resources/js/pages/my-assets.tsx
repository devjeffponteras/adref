import { Head, Link } from '@inertiajs/react';
import { FileDown, RefreshCw, Search, ArrowUpDown, Eye, Tag, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { WelcomeNote } from '@/components/welcome-note';

interface Classification {
    id: number;
    name: string;
}

interface Asset {
    id: number;
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

export default function MyAssets({ assets = [] }: MyAssetsProps) {

    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<keyof Asset | 'classification'>('id'); // Updated typing to explicitly allow our sort tracking
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); 
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.location.reload();
    };

    const getStatusStyles = (status: string = '') => {
        if (status.includes('On-going')) {
return 'bg-amber-50 text-amber-700 border-amber-200';
}

        if (status.includes('Pending')) {
return 'bg-gray-50 text-gray-700 border-gray-200';
}

        if (status.includes('Returned')) {
return 'bg-orange-50 text-orange-700 border-orange-200';
}

        if (status.includes('Approved')) {
return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

        return 'bg-rose-50 text-rose-700 border-rose-200'; 
    };

    const filteredAndSortedAssets = useMemo(() => {
        const result = [...assets].filter(asset => 
            (asset.serial_plate_id_number?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (asset.model?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (asset.brand_make?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (asset.status?.toLowerCase() || '').includes(search.toLowerCase()) || 
            asset.accountable_personnel.toLowerCase().includes(search.toLowerCase()) ||
            asset.end_user_department.toLowerCase().includes(search.toLowerCase()) ||
            (asset.classification?.name?.toLowerCase() || '').includes(search.toLowerCase())
        );

        result.sort((a, b) => {
            let valA: any;
            let valB: any;

            // FIX: If sorting by classification column, pull out the nested string name
            if (sortField === 'classification') {
                valA = a.classification?.name?.toLowerCase() || '';
                valB = b.classification?.name?.toLowerCase() || '';
            } else {
                valA = a[sortField as keyof Asset];
                valB = b[sortField as keyof Asset];
                
                if (valA === null || valA === undefined) {
valA = '';
}

                if (valB === null || valB === undefined) {
valB = '';
}

                if (typeof valA === 'string') {
valA = valA.toLowerCase();
}

                if (typeof valB === 'string') {
valB = valB.toLowerCase();
}
            }

            if (valA < valB) {
return sortDirection === 'asc' ? -1 : 1;
}

            if (valA > valB) {
return sortDirection === 'asc' ? 1 : -1;
}

            return 0;
        });

        return result;
    }, [assets, search, sortField, sortDirection]);

    // Updated handler function signature to accept 'classification' safely
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

    const exportToExcel = () => {
        const dataToExport = filteredAndSortedAssets.map(item => ({
            // 'Asset ID': item.id,
            'Control / Serial Number': item.serial_plate_id_number || 'N/A', // N/A if no data
            'Status': item.status || 'Pending',
            'Brand Make': item.brand_make || 'N/A', // N/A for now
            'Model Description': item.model || 'N/A', // N/A for now
            'Classification': item.classification?.name || 'Unclassified',
            'Accountable Personnel': item.accountable_personnel,
            'End User Department': item.end_user_department,
            'Asset Location': item.asset_location || 'N/A', // N/A for now
            'Date Created': formatDate(item.created_at)
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Inventory");
        XLSX.writeFile(workbook, "asset_inventory_logs.xlsx");
    };

    return (
        <>
            <Head title="My Assets" />

            {/* sub header */}
            {/* <WelcomeNote /> */}

            <div className="container mx-auto p-6 space-y-6">
            
                {/* Top Toolbar: Search, Refresh, and Export controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search serials, status, models, or departments..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Action Button - Converted to Inertia Link */}
                        <Link 
                            href="/create-asset" 
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="font-medium">
                                Create Asset Request
                            </span>
                        </Link>
                        
                        <button
                            onClick={exportToExcel}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                        >
                            <FileDown className="h-4 w-4" />
                            Export Excel
                        </button>

                        <button
                            onClick={handleRefresh}
                            className="cursor-pointer p-2 border rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                            title="Refresh Table"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Semantic Layout Table Data Grid Wrap */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-6 py-4 w-28">Action</th>
                                    
                                    <th onClick={() => handleSort('serial_plate_id_number')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Serial / Tag ID <ArrowUpDown className="h-3 w-3 text-gray-400" /></div>
                                    </th>

                                    <th onClick={() => handleSort('status')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Status <ArrowUpDown className="h-3 w-3 text-gray-400" /></div>
                                    </th>
                                    
                                    {/* FIXED: Keeps standard handleSort parameter pattern cleanly intact */}
                                    <th onClick={() => handleSort('classification')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Classification <ArrowUpDown className="h-3 w-3 text-gray-400" /></div>
                                    </th>

                                    <th onClick={() => handleSort('model')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Asset Details <ArrowUpDown className="h-3 w-3 text-gray-400" /></div>
                                    </th>

                                    <th onClick={() => handleSort('accountable_personnel')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Custodian & Office <ArrowUpDown className="h-3 w-3 text-gray-400" /></div>
                                    </th>

                                    <th onClick={() => handleSort('created_at')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                                        <div className="flex items-center gap-1.5">Date Added <ArrowUpDown className="h-3 w-3 text-gray-400" /></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {filteredAndSortedAssets.length > 0 ? (
                                    filteredAndSortedAssets.map((asset) => (
                                        <tr key={asset.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <Link 
                                                    href={`/assets/${asset.id}/asset-status`} 
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </Link>
                                            </td>

                                            <td className="px-6 py-3.5 font-mono font-medium text-gray-900">
                                                {asset.serial_plate_id_number || <span className="text-gray-300 italic">No SN Tag</span>}
                                            </td>

                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(asset.status)}`}>
                                                    {asset.status || 'Pending'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3.5">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                                                    <Tag className="h-2.5 w-2.5" />
                                                    {asset.classification?.name || 'Unclassified'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3.5">
                                                <div className="font-medium text-gray-800">
                                                    {asset.brand_make || ''} {asset.model || 'Generic Item'}
                                                </div>
                                                {asset.asset_location && (
                                                    <div className="text-xs text-gray-400 mt-0.5">Loc: {asset.asset_location}</div>
                                                )}
                                            </td>

                                            <td className="px-6 py-3.5">
                                                <div className="text-gray-900 font-medium">{asset.accountable_personnel}</div>
                                                <div className="text-xs text-gray-400">{asset.end_user_department}</div>
                                            </td>

                                            <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">
                                                {formatDate(asset.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                                            No matching assets found in the system.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
            </div>
        </>
    );
}

MyAssets.layout = {
    breadcrumbs: [
        {
            title: 'My Assets',
            href: '/my-assets', 
        },
    ],
};