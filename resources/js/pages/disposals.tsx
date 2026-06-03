import { Head, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { disposals } from '@/routes';
import { Calendar, Loader, FileWarning, RefreshCw, ArrowUpDown, Tag, Eye} from 'lucide-react';
import * as XLSX from 'xlsx';

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

export default function Disposals({ assets = [] }: MyAssetsProps) {

    console.log("Inertia Received Assets:", assets);

    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<keyof Asset | 'classification'>('id'); // Updated typing to explicitly allow our sort tracking
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); 
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.location.reload();
    };

    const getStatusStyles = (status: string = '') => {
        if (status.includes('On-going')) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (status.includes('Approved')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (status.includes('Pending')) return 'bg-gray-50 text-gray-700 border-gray-200';
        return 'bg-rose-50 text-rose-700 border-rose-200'; 
    };

    const filteredAndSortedAssets = useMemo(() => {
        let result = [...assets].filter(asset => 
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
            'Control Number': item.control_number || 'N/A', // N/A if no data
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
            <Head title="Assets for Disposal" />

            {/* Main Content Container */}
            <div className="w-full p-6 bg-gray-50/50 min-h-screen">
            
                {/* Action Buttons & Counter Indicators Strip */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-800">
                    
                    {/* Action Filters Group */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Upcoming Button */}
                        <button className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <Calendar className='w-4 h-4'></Calendar>
                        <span>Upcoming</span>
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white min-w-5">
                            8
                        </span>
                        </button>
                        
                        {/* In Progress Button */}
                        <button className="cursor-pointer group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <Loader className='w-4 h-4 transition-transform duration-500 ease-out group-hover:rotate-180'></Loader>
                        <span>In Progress</span>
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-rose-600 text-white min-w-5">
                            88
                        </span>
                        </button>
                        
                        {/* Pending Transactions Button */}
                        <button className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <FileWarning className='w-4 h-4'></FileWarning>
                        <span>Pending Transactions</span>
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-rose-600 text-white min-w-5">
                            12
                        </span>
                        </button>
                    </div>

                    </div>
                </div>

                {/* Asset Transaction Logs Card Layout */}
                <div className="overflow-hidden rounded-2xl border border-emerald-100/60 bg-linear-to-b from-white to-emerald-50/10 shadow-md shadow-emerald-900/2">
                    
                    {/* Card Header component wrapper */}
                    <div className="flex items-center justify-between border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-1.5 rounded-full bg-emerald-600" />
                        <h5 className="text-lg font-bold tracking-tight text-[#004d40]">
                        Asset Transaction Logs
                        </h5>
                    </div>
                    <div>
                        <button 
                            id="btn-refresh-dt" 
                            className="group inline-flex items-center justify-center px-2 py-1.5 rounded-md border border-emerald-600 text-xs font-medium text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer" 
                            title="Refresh Table"
                            >
                            <RefreshCw className="h-5 w-5 transition-transform duration-500 ease-out group-hover:rotate-180" />
                        </button>
                    </div>
                    </div>

                    {/* Table Layout Wrapper with scrolling fallback */}
                    <div className="overflow-x-auto w-full">
                    <table id="assetTable" className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                        <thead className="bg-emerald-50/60 text-xs font-bold uppercase tracking-wider text-emerald-800/80">
                            <tr>
                                <th className="px-6 py-4 w-28">Action</th>
                                
                                <th onClick={() => handleSort('serial_plate_id_number')} className="px-6 py-4 cursor-pointer hover:bg-gray-100 select-none transition-colors">
                                    <div className="flex items-center gap-1.5">Control Number <ArrowUpDown className="h-3 w-3 text-gray-400" /></div>
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
                        
                        <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
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
                                                {asset.control_number || <span className="text-gray-300 italic">No Ctrl Num</span>}
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
        
Disposals.layout = {
    breadcrumbs: [
        {
            title: 'Assets for Disposal',
            href: disposals(),
        },
    ],
};