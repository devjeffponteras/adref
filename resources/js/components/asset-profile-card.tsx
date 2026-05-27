import { ClipboardList, Building2, AlertCircle } from 'lucide-react';

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
        user?: User;
        classification?: AssetClassification;
    };
}

export function AssetProfileCard({ asset }: AssetProfileCardProps) {
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    
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