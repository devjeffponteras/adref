import { Head, Link, useForm } from '@inertiajs/react';
import { WelcomeNote } from '@/components/welcome-note';
import { CircleCheck, ArrowLeftCircle, XIcon } from 'lucide-react';

interface AsidInformation {
    id: number;
    remarks: string;
    checked_by: string;
    disposition: string;
    reviewed_by: string;
}

interface AssetProps {
    asset: {
        id: number;
        control_number: string;
        department?: string;
        asid_information?: AsidInformation | null;
    };
}

export default function AsidEvaluate({ asset }: AssetProps) {

    const isLockedAsid = !!asset?.asid_information;

    const { data, setData, post, processing, errors } = useForm({
        remarks: asset.asid_information?.remarks || (asset as any).asidInformation?.remarks || '',
        checked_by: asset.asid_information?.checked_by || '',
        disposition: asset.asid_information?.disposition || '',
        reviewed_by: asset.asid_information?.reviewed_by || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/asid-evaluate/${asset.id}/action`);
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
                            <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                                <CircleCheck className='h-3 w-3 mr-1'></CircleCheck>
                                Submitted to Workflow
                            </span>
                        </h3>

                        {/* Section 1: Remarks & Checked By */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
                            <div className="xl:col-span-6 flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Remarks
                                </label>
                                <textarea 
                                    rows={2}
                                    value={data.remarks}
                                    onChange={(e) => setData('remarks', e.target.value)}
                                    className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                            ${isLockedAsid
                                                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                            }`}
                                    placeholder="Enter evaluation remarks..."
                                />
                                {errors.remarks && <span className="text-red-500 text-xs">{errors.remarks}</span>}
                            </div>

                            <div className="xl:col-span-6 flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Checked by
                                </label>
                                <input 
                                    type="text" 
                                    value={data.checked_by}
                                    onChange={(e) => setData('checked_by', e.target.value)}
                                    className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                            ${isLockedAsid
                                                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                            }`}
                                    placeholder="Name of inspector"
                                />
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
                                    className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                            ${isLockedAsid
                                                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                            }`}
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
                                    disabled
                                    value={data.reviewed_by}
                                    onChange={(e) => setData('reviewed_by', e.target.value)}
                                    className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150
                                            ${isLockedAsid
                                                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                            }`}
                                    placeholder="Name of manager"
                                />
                            </div>

                            <div className="xl:col-span-5 hidden xl:block"></div>

                        </div>

                        {/* Bottom Footer Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                            {/* Redirect back to dashboard safely on cancel */}
                            <Link 
                                    href="/asid-dashboard" 
                                    className="inline-flex items-center cursor-pointer px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-hidden"
                                >
                                    {isLockedAsid ? <ArrowLeftCircle className='h-4 w-4 mr-1'></ArrowLeftCircle> : <XIcon className='h-4 w-4 mr-1'></XIcon> }
                                    {isLockedAsid ? 'Back to Dashboard' : 'Cancel' }
                            </Link>
                            {!isLockedAsid ? 
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="inline-flex items-center px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm shadow-emerald-900/10 transition-all hover:shadow-md disabled:opacity-50 cursor-pointer"
                            >
                                <CircleCheck className='h-5 w-5 mr-2'></CircleCheck>
                                {processing ? (
                                    'Saving...'
                                ) : (
                                    <>
                                        Approve & Submit to <span className="text-yellow-400 font-bold ml-1">Workflow</span>
                                    </>
                                )}
                            </button>
                            : ''}
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