import { Head } from '@inertiajs/react';

// 1. Define the TypeScript structure matching your Laravel API data
interface Transaction {
    id: number;
    transid: string;
    source_app: string;
    purpose: string;
    department: string;
    status: string;
    source_url: string;
}

// 2. Apply the Type to your component props
interface WorkflowIndexProps {
    transactions?: Transaction[];
}

export default function WorkflowIndex({ transactions = [] }: WorkflowIndexProps) {
    return (
        <>
            <Head title="Workflow Dashboard" />

            <div className="p-6 max-w-7xl mx-auto">
                {/* Header Area */}
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">WorkFlow Transactions</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            List of all workflow transaction requests.
                        </p>
                    </div>
                </div>

                {/* Table Container Card */}
                <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                                <tr>
                                    <th className="px-6 py-4">Trans ID</th>
                                    <th className="px-6 py-4">Source App</th>
                                    <th className="px-6 py-4">Purpose</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <tr key={tx.id || tx.transid} className="hover:bg-gray-50 transition-colors">
                                            {/* Trans ID */}
                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                                {tx.transid}
                                            </td>
                                            {/* Source App */}
                                            <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                                                {tx.source_app}
                                            </td>
                                            {/* Purpose */}
                                            <td className="px-6 py-4 max-w-xs truncate text-gray-600" title={tx.purpose}>
                                                {tx.purpose}
                                            </td>
                                            {/* Department */}
                                            <td className="px-6 py-4 text-gray-500">
                                                {tx.department}
                                            </td>
                                            {/* Dynamic Status Badge */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide
                                                    ${tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 
                                                    tx.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                                                    'bg-gray-100 text-gray-800 border border-gray-200'
                                                    }`}
                                                >
                                                    {tx.status}
                                                </span>
                                            </td>
                                            {/* Action Button */}
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                <a 
                                                    href={tx.source_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="inline-flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition"
                                                >
                                                    View Original
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    /* Empty State Graphic Placeholder */
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="text-gray-400 d=M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No transactions</h3>
                                            <p className="mt-1 text-sm text-gray-500">Everything caught up! No tasks found right now.</p>
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

WorkflowIndex.layout = {
    breadcrumbs: [
        {
            title: 'Workflow',
            href: '/admin/workflow/index',
        },
    ],
};