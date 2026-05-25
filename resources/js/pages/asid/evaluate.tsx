import { Head, Link, useForm } from '@inertiajs/react';
import { WelcomeNote } from '@/components/welcome-note';
import { WelcomeNoteMini } from '@/components/welcome-note-mini';

interface AssetProps {
    asset: {
        id: number;
        control_number: string;
        department?: string;
    };
}

export default function AsidEvaluate({ asset }: AssetProps) {

    const { data, setData, post, processing, errors } = useForm({
        remarks: '',
        checked_by: '',
        disposition: '',
        reviewed_by: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <>
            <Head title={`Evaluate - ${asset?.control_number || 'Asset'}`} />

            {/* sub header */}
            <WelcomeNote />
            
            {/* main content */}
            <div className="container-fluid p-4">

                <form onSubmit={handleSubmit} className="w-full max-w-7xl mx-auto p-4 space-y-4">
            
                    {/* Header Banner - Now completely dynamic! */}
                    <div className="bg-emerald-800 text-white px-6 py-4 rounded-xl shadow-xs font-semibold text-lg flex items-center">
                        Asset Information: {asset?.control_number || 'N/A'}
                    </div>

                    {/* Main Form Container Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        
                        <h3 className="text-gray-900 font-bold text-lg tracking-tight">
                            Evaluation Information
                        </h3>

                        {/* Section 1: Remarks & Checked By */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
                            <div className="xl:col-span-5 flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Remarks
                                </label>
                                <textarea 
                                    rows={2} 
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-hidden transition-all resize-none"
                                    placeholder="Enter evaluation remarks..."
                                />
                                {errors.remarks && <span className="text-red-500 text-xs">{errors.remarks}</span>}
                            </div>

                            <div className="xl:col-span-5 flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Checked by
                                </label>
                                <input 
                                    type="text" 
                                    value={data.checked_by}
                                    onChange={(e) => setData('checked_by', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 h-14.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-hidden transition-all"
                                    placeholder="Name of inspector"
                                />
                            </div>

                            <div className="xl:col-span-2">
                                <button 
                                    type="button" 
                                    className="w-full h-11.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
                                >
                                    Update Document
                                </button>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Section 2: Disposition */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                            <div className="xl:col-span-5 flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Disposition
                                </label>
                                <textarea 
                                    rows={2} 
                                    value={data.disposition}
                                    onChange={(e) => setData('disposition', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-hidden transition-all resize-none"
                                    placeholder="Recommended disposal action..."
                                />
                            </div>
                        </div>

                        {/* Section 3: Reviewed and Noted By */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
                            <div className="xl:col-span-5 flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Reviewed and Noted By
                                </label>
                                <input 
                                    type="text" 
                                    value={data.reviewed_by}
                                    onChange={(e) => setData('reviewed_by', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 h-11.5 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-hidden transition-all"
                                    placeholder="Name of manager"
                                />
                            </div>

                            <div className="xl:col-span-5 hidden xl:block"></div>

                            <div className="xl:col-span-2">
                                <button 
                                    type="button" 
                                    className="w-full h-11.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
                                >
                                    Update Document
                                </button>
                            </div>
                        </div>

                        {/* Bottom Footer Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                            {/* Redirect back to dashboard safely on cancel */}
                            <Link 
                                href="/asid-dashboard"
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg border border-gray-300 shadow-xs transition-all text-center"
                            >
                                Cancel
                            </Link>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm shadow-emerald-900/10 transition-all hover:shadow-md disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Saving...' : 'Save & Submit'}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </>
    );
}

AsidEvaluate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/asid-dashboard', 
        },
    ],
};