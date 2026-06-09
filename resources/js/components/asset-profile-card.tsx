import { ClipboardList, Building2, AlertCircle, FileText, ImageIcon, Download } from 'lucide-react';

// Define the exact structural footprint needed for this component to run
interface User {
    id: number;
    name: string;
}

interface AssetClassification {
    id: number;
    name: string;
}

interface AssetProfileCardProps {
    asset: {
        accountable_personnel: string;
        control_number: string;
        brand_make: string;
        model: string;
        serial_plate_id_number: string;
        end_user_department: string;
        asset_location: string;
        reasons_for_disposal: string;
        assessment_report_path: string | null;
        asset_photo_path: string | null;
        user?: User;
        classification?: AssetClassification;
    };
}

export function AssetProfileCard({ asset }: AssetProfileCardProps) {

    const openDocumentSecurely = (path: string | null) => {
        if (!path) return;
        window.open(`/storage/${path}`, '_blank');
    };


    return (
        <div className="bg-white rounded-2xl border border-emerald-100/60 shadow-md shadow-emerald-900/3 overflow-hidden main-info-card">
            {/* Card Header Section */}
            <div className="bg-emerald-50/60 px-6 py-4 border-b border-emerald-100/40 flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-xs">
                    <ClipboardList className="w-4 h-4 text-emerald-600" /> Asset Master Profile Specifications
                </div>
                <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                    Verification Detail
                </span>
            </div>

            {/* Integrated Grid Content */}
            <div className="p-6 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
                    
                    {/* Left Column: Core Administrative Information */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700/80 mb-2 pb-1 border-b border-gray-100">
                            Registration Information
                        </h3>

                        <div>
                            <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Asset Control Number</span>
                            <span className="text-gray-800 font-semibold">{asset.control_number}</span>
                        </div>
                        
                        <div>
                            <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Accountable Personnel</span>
                            <span className="text-gray-800 font-semibold">{asset.accountable_personnel}</span>
                        </div>

                        <div>
                            <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Filer / Registrant</span>
                            <span className="text-gray-800 font-medium">{asset.user?.name || 'N/A'}</span>
                        </div>

                        <div>
                            <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">End-User Department</span>
                            <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                                <Building2 className="w-3.5 h-3.5 text-gray-400" /> {asset.end_user_department}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Technical Properties & Hardware Parameters */}
                    <div className="space-y-4 md:border-l md:border-gray-100 md:pl-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700/80 mb-2 pb-1 border-b border-gray-100">
                            Technical Specifications
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Brand / Make</span>
                                <span className="text-gray-800 font-semibold">{asset.brand_make || '—'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Model Standard</span>
                                <span className="text-gray-800 font-medium">{asset.model || '—'}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Serial / Plate ID Number</span>
                            <span className="font-mono text-gray-700 bg-gray-50 px-2 py-0.5 rounded text-xs inline-block border border-gray-200/60 mt-0.5">
                                {asset.serial_plate_id_number || 'N/A'}
                            </span>
                        </div>

                        <div>
                            <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-0.5">Asset Classification Category</span>
                            <span className="text-gray-800 font-medium">{asset.classification?.name || 'Unclassified Row'}</span>
                        </div>
                    </div>

                    {/* Attachments Showcase */}
                    <div className="space-y-4 md:border-l md:border-gray-100 md:pl-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700/80 mb-2 pb-1 border-b border-gray-100">
                            Attachments
                        </h3>
                        {/* Component A: Technical Assessment Report Attachment */}
                        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-all group">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Assessment Report</h4>
                                    <p className="text-xs text-gray-400 truncate mb-3">{asset.assessment_report_path ? 'Technical_Assessment_Report.pdf' : 'No document attached'}</p>
                                    
                                    {asset.assessment_report_path ? (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => openDocumentSecurely(asset.assessment_report_path)}
                                                className="text-xs inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold transition-colors bg-white px-2 py-1 rounded shadow-xs border border-gray-100"
                                            >
                                                View Tab
                                            </button>
                                            <a 
                                                href={`/storage/${asset.assessment_report_path}`} 
                                                download
                                                className="text-xs inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition-colors bg-white px-2 py-1 rounded shadow-xs border border-gray-100"
                                            >
                                                <Download className="w-3 h-3" /> Download
                                            </a>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Component B: Graphic Evidence Asset Photo Attachment */}
                        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-all group">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Physical Evidence Photo</h4>
                                    <p className="text-xs text-gray-400 truncate mb-3">{asset.asset_photo_path ? 'Asset_Condition_Image.jpg' : 'No photo uploaded'}</p>
                                    
                                    {asset.asset_photo_path ? (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => openDocumentSecurely(asset.asset_photo_path)}
                                                className="text-xs inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold transition-colors bg-white px-2 py-1 rounded shadow-xs border border-gray-100"
                                            >
                                                View Image
                                            </button>
                                            <a 
                                                href={`/storage/${asset.asset_photo_path}`} 
                                                download
                                                className="text-xs inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition-colors bg-white px-2 py-1 rounded shadow-xs border border-gray-100"
                                            >
                                                <Download className="w-3 h-3" /> Save File
                                            </a>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Full-width Row Footer Sections */}
                <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 gap-5">
                    <div>
                        <span className="text-gray-400 block text-xs font-medium uppercase tracking-wider mb-1">Asset Operational Location</span>
                        <span className="text-gray-700 font-medium">{asset.asset_location}</span>
                    </div>

                    <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/50">
                        <span className="text-amber-800 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600" /> Reasons for Condemnation &amp; Disposal
                        </span>
                        <p className="text-gray-600 leading-relaxed text-sm pl-0.5">
                            {asset.reasons_for_disposal}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}