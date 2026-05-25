import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { dashboard } from '@/routes';
import { Package, Clock, CircleCheck, RefreshCw } from 'lucide-react';
import FilterDropdown from '@/components/ui/filter-dropdown';
import { WelcomeNote } from '@/components/welcome-note';
import { WelcomeNoteMini } from '@/components/welcome-note-mini';

interface RequestData {
  receivedFrom: string;
  total: number;
  status: 'pending' | 'approved';
}

export default function Dashboard() {

    const initialData: RequestData[] = [
        { receivedFrom: 'End-User (departments)', total: 50, status: 'pending' },
        { receivedFrom: 'Evaluation Team (Accounting, MCDMEPEO)', total: 30, status: 'approved' },
        { receivedFrom: 'Executive Team', total: 8, status: 'approved' },
    ];

    const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'all'>('all');

    const handleFilterSelection = (status: 'pending' | 'approved') => {
        setFilterStatus(status);
    };

    const handleResetFilters = () => {
        setFilterStatus('all');
    };

    const displayedRows = initialData.filter((row) => {
        if (filterStatus === 'all') return true;
        return row.status === filterStatus;
    });
    
    return (
        <>
            <Head title="Dashboard" />

            {/* sub header */}
            <WelcomeNote></WelcomeNote>

            {/* main content */}
            <div className="container-fluid p-4">

                {/* mini sub header */}
                <WelcomeNoteMini></WelcomeNoteMini>
                
                <div className="flex flex-col md:flex-row gap-4 mb-5">
                    <div className="w-full md:w-1/3">
                        <div className="stat-card bg-emerald text-white border-0 shadow-sm h-20 hover:-translate-y-1.5 cursor-pointer">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="mb-1 opacity-75 text-sm">Total Requests from End-User</p>
                                    <h2 className="font-bold text-2xl">24</h2>
                                </div>
                                <Package className='h-8 w-8 opacity-80'></Package>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3">
                        <div className="stat-card bg-leaf text-white border-0 shadow-sm h-20 hover:-translate-y-1.5 cursor-pointer">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="mb-1 opacity-75 text-sm">In Progress</p>
                                    <h2 className="font-bold text-2xl">12</h2>
                                </div>
                                <Clock className='h-8 w-8 opacity-80'></Clock>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/3">
                        <div className="stat-card bg-dark-green text-white border-0 shadow-sm h-20 hover:-translate-y-1.5 cursor-pointer">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="mb-1 opacity-75 text-sm">Received from Evaluation Team</p>
                                    <h2 className="font-bold text-2xl">158</h2>
                                </div>
                                <CircleCheck className='h-8 w-8 opacity-80'></CircleCheck>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Container */}
                <div className="my-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                
                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                        <div className='inline-flex items-center gap-3'>
                            <div className="h-5 w-1.5 rounded-full bg-emerald-600" />
                            <h5 className="text-lg font-bold text-[#004d40]">Summary of all ADREF Requests</h5>
                        </div>
                        
                        {/* Header Actions */}
                        <div className="flex items-center gap-2">

                            {/* Dropdown Filter Here */}
                            <FilterDropdown 
                                onFilterChange={handleFilterSelection} 
                                onReset={handleResetFilters} 
                            />
                            

                            {/* Refresh Button */}
                            <button 
                                id="refresh-summary" 
                                className="group inline-flex items-center justify-center px-2 py-1.5 rounded-md border border-emerald-600 text-xs font-medium text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer" 
                                title="Refresh Table"
                                >
                                <RefreshCw className="h-5 w-5 transition-transform duration-500 ease-out group-hover:rotate-180" />
                            </button>
                        </div>
                    </div>

                    {/* Card Body & Responsive Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-gray-100 text-left align-middle text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                            <th scope="col" className="py-3.5 pl-6 pr-3 font-medium text-gray-600 tracking-wide">Received From</th>
                            <th scope="col" className="px-3 py-3.5 font-medium text-gray-600 tracking-wide">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            <tr className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-4 pl-6 pr-3 font-medium text-gray-900">End-User (departments)</td>
                            <td className="px-3 py-4 text-gray-600">50</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-4 pl-6 pr-3 font-medium text-gray-900">Evaluation Team (Accounting, MCDMEPEO)</td>
                            <td className="px-3 py-4 text-gray-600">30</td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-4 pl-6 pr-3 font-medium text-gray-900">Executive Team</td>
                            <td className="px-3 py-4 text-gray-600">8</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                </div>

                <div className="my-6 overflow-hidden rounded-2xl border border-emerald-100/60 bg-linear-to-b from-white to-emerald-50/10 shadow-md shadow-emerald-900/3">
                    {/* Card Header Layer */}
                    <div className="flex items-center justify-between border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm px-6 py-4">
                        <div className="flex items-center gap-3">
                        {/* Decorative emerald line indicator */}
                            <div className="h-5 w-1.5 rounded-full bg-emerald-600" />
                            <h5 className="text-lg font-bold tracking-tight text-[#004d40]">
                                Recent ADREF submitted
                            </h5>
                        </div>
                    </div>

                    {/* Card Body & Responsive Data Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                        <thead className="bg-emerald-50/60 text-xs font-bold uppercase tracking-wider text-emerald-800/80">
                            <tr>
                            <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Application Date &amp; Time</th>
                            <th scope="col" className="px-4 py-3.5 font-semibold">Asset Control Number</th>
                            <th scope="col" className="px-4 py-3.5 font-semibold">Department</th>
                            <th scope="col" className="px-4 py-3.5 font-semibold">Created By</th>
                            <th scope="col" className="px-4 py-3.5 font-semibold">Updated At</th>
                            <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        
                        <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                            {/* Row 1 */}
                            <tr className="group hover:bg-emerald-50/30 transition-all duration-150">
                            <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                Apr 12, 2026 10:30 AM
                            </td>
                            <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                AD-26-019
                            </td>
                            <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                                Audit and Systems Improvement Department
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-700">
                                BL Villa
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-400 group-hover:text-gray-500">
                                12 hours ago
                            </td>
                            <td className="py-4 pr-6 text-center whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                Pending
                                </span>
                            </td>
                            </tr>

                            {/* Row 2 */}
                            <tr className="group hover:bg-emerald-50/30 transition-all duration-150">
                            <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                Apr 12, 2026 10:30 AM
                            </td>
                            <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                AD-26-02
                            </td>
                            <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                                Audit and Systems Improvement Department
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-700">
                                BL Villa
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-400 group-hover:text-gray-500">
                                12 hours ago
                            </td>
                            <td className="py-4 pr-6 text-center whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                Pending
                                </span>
                            </td>
                            </tr>

                            {/* Row 3 */}
                            <tr className="group hover:bg-emerald-50/30 transition-all duration-150">
                            <td className="py-4 pl-6 pr-3 font-medium text-gray-900 group-hover:text-emerald-900 transition-colors">
                                Apr 12, 2026 10:30 AM
                            </td>
                            <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-700 bg-gray-50/40 group-hover:bg-transparent">
                                AD-26-03
                            </td>
                            <td className="px-4 py-4 max-w-xs truncate text-gray-500 group-hover:text-gray-700">
                                Audit and Systems Improvement Department
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-700">
                                BL Villa
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-400 group-hover:text-gray-500">
                                12 hours ago
                            </td>
                            <td className="py-4 pr-6 text-center whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                Pending
                                </span>
                            </td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                </div>
                
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
