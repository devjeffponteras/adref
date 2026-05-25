import { Head } from '@inertiajs/react';
import { bidding } from '@/routes';
import { Calendar, Loader, FileWarning, RefreshCw } from 'lucide-react';

export default function Bidding() {

    return (
        <>
            <Head title="Assets for Bidding" />

            {/* Main Content Container Wrapper */}
            <div className="w-full p-6 bg-gray-50/50 min-h-screen">

                {/* Page Info Heading Bar */}
                <div className="mb-6 overflow-hidden rounded-xl border border-emerald-600 bg-emerald-600 p-4 shadow-md shadow-emerald-950/10">
                    <div className="flex items-center justify-between">
                    <div className="flex flex-col text-white">
                        <h5 className="text-lg font-bold tracking-wide">
                        List of Assets for Bidding — March 2026 Bidding Cycle
                        </h5>
                    </div>
                    </div>
                </div>

                {/* Category A Card Layout Container */}
                <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-100/60 bg-linear-to-b from-white to-emerald-50/10 shadow-md shadow-emerald-900/2">
                    
                    {/* Category A Inner Label Section */}
                    <div className="border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm px-6 py-4">
                    <h5 className="text-center text-sm font-bold uppercase tracking-wider text-[#004d40]">
                        Category A — List of Assets for Bidding for PMC and MMPRC Employees
                    </h5>
                    </div>

                    {/* Table layout wrapper with responsive x-axis layout backup */}
                    <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                        <thead className="bg-emerald-50/60 text-xs font-bold uppercase tracking-wider text-emerald-800/80">
                        <tr>
                            <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Name of Asset</th>
                            <th scope="col" className="px-4 py-3.5 font-semibold">Asset Details</th>
                            <th scope="col" className="px-4 py-3.5 font-semibold">Appraised Value</th>
                            <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Bidding Application</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                        {/* Row 1 */}
                        <tr className="group hover:bg-emerald-50/30 transition-all duration-150">
                            <td className="py-4 pl-6 pr-3 font-mono text-xs font-bold text-gray-900 group-hover:text-emerald-900">
                            AD-26-01
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-700">
                            HILUX GR 2025
                            </td>
                            <td className="px-4 py-4 font-semibold text-gray-900">
                            PHP 10,000.00
                            </td>
                            <td className="py-4 pr-6 text-center whitespace-nowrap">
                                <a 
                                    href="#" 
                                    className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 text-decoration-none"
                                >
                                    Post Bid Entry
                                </a>
                            </td>
                        </tr>
                        {/* Row 2 */}
                        <tr className="group hover:bg-emerald-50/30 transition-all duration-150">
                            <td className="py-4 pl-6 pr-3 font-mono text-xs font-bold text-gray-900 group-hover:text-emerald-900">
                            AD-26-02
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-700">
                            FORD RANGER 2024
                            </td>
                            <td className="px-4 py-4 font-semibold text-gray-900">
                            PHP 11,000.00
                            </td>
                            <td className="py-4 pr-6 text-center whitespace-nowrap">
                                <a 
                                    href="#" 
                                    className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 text-decoration-none"
                                >
                                    Post Bid Entry
                                </a>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* Category B Card Layout Container */}
                <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-100/60 bg-linear-to-b from-white to-emerald-50/10 shadow-md shadow-emerald-900/2">
                    
                    {/* Category B Inner Label Section */}
                    <div className="border-b border-emerald-100/50 bg-white/80 backdrop-blur-sm px-6 py-4">
                    <h5 className="text-center text-sm font-bold uppercase tracking-wider text-[#004d40]">
                        Category B — List of Assets for Bidding for Everyone Including Outsiders and Contractors
                    </h5>
                    </div>

                    {/* Table layout wrapper */}
                    <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-full divide-y divide-emerald-100/40 text-left align-middle text-sm">
                        <thead className="bg-emerald-50/60 text-xs font-bold uppercase tracking-wider text-emerald-800/80">
                        <tr>
                            <th scope="col" className="py-3.5 pl-6 pr-3 font-semibold">Name of Asset</th>
                            <th scope="col" className="px-4 py-3.5 font-semibold">Asset Details</th>
                            <th scope="col" className="px-4 py-3.5 font-semibold">Appraised Value</th>
                            <th scope="col" className="py-3.5 pr-6 font-semibold text-center">Bidding Application</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-100/30 bg-white text-gray-600">
                        {/* Row 1 */}
                        <tr className="group hover:bg-emerald-50/30 transition-all duration-150">
                            <td className="py-4 pl-6 pr-3 font-mono text-xs font-bold text-gray-900 group-hover:text-emerald-900">
                            AD-26-03
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-700">
                            Starmobile Cellphone
                            </td>
                            <td className="px-4 py-4 font-semibold text-gray-900">
                            PHP 300.00
                            </td>
                            <td className="py-4 pr-6 text-center whitespace-nowrap">
                                <a 
                                    href="#" 
                                    className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 text-decoration-none"
                                >
                                    Post Bid Entry
                                </a>
                            </td>
                        </tr>
                        {/* Row 2 */}
                        <tr className="group hover:bg-emerald-50/30 transition-all duration-150">
                            <td className="py-4 pl-6 pr-3 font-mono text-xs font-bold text-gray-900 group-hover:text-emerald-900">
                            AD-26-04
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-700">
                            Dell Monitor
                            </td>
                            <td className="px-4 py-4 font-semibold text-gray-900">
                            PHP 2,500.00
                            </td>
                            <td className="py-4 pr-6 text-center whitespace-nowrap">
                            <a 
                                href="#" 
                                className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 text-decoration-none"
                            >
                                Post Bid Entry
                            </a>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </div>
                </div>

                {/* Bottom Export Action Footer Wrapper */}
                <div className="flex flex-wrap items-center justify-start gap-4 my-6">
                    <button className="inline-flex items-center justify-center px-4 py-2 rounded bg-emerald-600 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                    Export to Excel
                    </button>
                    <button className="inline-flex items-center justify-center px-4 py-2 rounded bg-emerald-600 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                    Export to Bid Entries
                    </button>
                </div>

            </div>
        </>
    );
}
        
Bidding.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: bidding(),
        },
    ],
};