import React from 'react';
import { Head } from '@inertiajs/react';
import SubHeader from '@/components/sub-header';
import { Link, useForm } from '@inertiajs/react';
import { FileText, Plus, X, FolderHeart, Upload } from 'lucide-react';
import { createAsset } from '@/routes';

interface Classification {
    id: number;
    name: string;
}

interface Props {
    classifications: Classification[];
}

export default function CreateAsset({ classifications }: Props) {

    // FIXED: Changed keys to match your backend database snake_case structure
    const { data, setData, post, processing, errors, reset } = useForm({
        accountable_personnel: '',
        model: '',
        description: '', // If you use an extra column for reason or notes
        brand_make: '',
        serial_plate_id_number: '',
        end_user_department: '',
        asset_classification_id: '', 
        reasons_for_disposal: '', 
        asset_location: '',
        assessment_report_path: null as File | null,
        asset_photo_path: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/store-asset', {
            forceFormData: true, // Crucial for uploading file binaries
            onSuccess: () => reset(),
        });
    };

    return (
        <>
        <Head title="Scan / Log Asset" />

            <SubHeader />

            <div className="w-full p-4 max-w-6xl mx-auto space-y-6">
            
                <div className="bg-emerald-700 p-5 rounded-xl shadow-sm border border-emerald-800">
                    <div className="flex justify-between items-center text-white">
                        <div className="flex items-center gap-2.5">
                            <FileText className="h-5 w-5 opacity-90" />
                            <h5 className="font-semibold text-lg tracking-tight">Asset Information</h5>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Accountable Personnel */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="accountable_personnel" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Accountable Personnel
                                </label>
                                <input
                                    type="text"
                                    id="accountable_personnel"
                                    value={data.accountable_personnel}
                                    onChange={e => setData('accountable_personnel', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                                {/* <select 
                                    value={data.usage_type} 
                                    onChange={e => setData('usage_type', e.target.value)}
                                >
                                    <option value="">Select an option...</option>
                                    {usageTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select> */}
                                {errors.accountable_personnel && <span className="text-xs text-rose-500 font-medium">{errors.accountable_personnel}</span>}
                            </div>

                            {/* Model */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="model" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    id="model"
                                    value={data.model}
                                    onChange={e => setData('model', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                                {errors.model && <span className="text-xs text-rose-500 font-medium">{errors.model}</span>}
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="description" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            {/* Brand/Make */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="brand_make" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Brand / Make
                                </label>
                                <input
                                    type="text"
                                    id="brand_make"
                                    value={data.brand_make}
                                    onChange={e => setData('brand_make', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                                {errors.brand_make && <span className="text-xs text-rose-500 font-medium">{errors.brand_make}</span>}
                            </div>

                            {/* Serial Number */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="serial_plate_id_number" className="text-xs font-bold text-gray-700 uppercase tracking-wider truncate">
                                    Serial / Plate / ID Number
                                </label>
                                <input
                                    type="text"
                                    id="serial_plate_id_number"
                                    value={data.serial_plate_id_number}
                                    onChange={e => setData('serial_plate_id_number', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                                {errors.serial_plate_id_number && <span className="text-xs text-rose-500 font-medium">{errors.serial_plate_id_number}</span>}
                            </div>

                            {/* Department */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="end_user_department" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    End-User / Department
                                </label>
                                <input
                                    type="text"
                                    id="end_user_department"
                                    value={data.end_user_department}
                                    onChange={e => setData('end_user_department', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                                {errors.end_user_department && <span className="text-xs text-rose-500 font-medium">{errors.end_user_department}</span>}
                            </div>

                            {/* Asset Classification Select Dropdown */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="asset_classification_id" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Asset Classification
                                </label>
                                <select
                                    id="asset_classification_id"
                                    value={data.asset_classification_id}
                                    onChange={e => setData('asset_classification_id', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-gray-700"
                                >
                                    <option value="" disabled>Select Classification..</option>
                                    {classifications && classifications.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.asset_classification_id && <span className="text-xs text-rose-500 font-medium">{errors.asset_classification_id}</span>}
                            </div>

                            {/* Reasons for disposal */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="reasons_for_disposal" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Reason/s for Disposal
                                </label>
                                <input
                                    type="text"
                                    id="reasons_for_disposal"
                                    value={data.reasons_for_disposal}
                                    onChange={e => setData('reasons_for_disposal', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            {/* Asset Location */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="asset_location" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Asset Location
                                </label>
                                <input
                                    type="text"
                                    id="asset_location"
                                    value={data.asset_location}
                                    onChange={e => setData('asset_location', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 font-medium">
                            * Note: All asset information needed should be filled out, please indicate N/A for not applicable sections.
                        </div>

                        {/* File Attachments */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                            
                            {/* Document Attachment Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    + Attach Assessment Report
                                </label>
                                <div className="flex items-center gap-2">
                                    <label className="flex-1 flex items-center justify-between border border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-lg px-4 py-2 cursor-pointer transition-colors group">
                                        <span className="text-sm text-gray-500 truncate max-w-50 md:max-w-75">
                                            {data.assessment_report_path ? data.assessment_report_path.name : "Choose assessment report..."}
                                        </span>
                                        <Upload className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={e => setData('assessment_report_path', e.target.files ? e.target.files[0] : null)}
                                        />
                                    </label>
                                </div>
                                {errors.assessment_report_path && <span className="text-xs text-rose-500 font-medium">{errors.assessment_report_path}</span>}
                            </div>

                            {/* Photo Upload Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    + Clear Photo of the Asset
                                </label>
                                <div className="flex items-center gap-2">
                                    <label className="flex-1 flex items-center justify-between border border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-lg px-4 py-2 cursor-pointer transition-colors group">
                                        <span className="text-sm text-gray-500 truncate max-w-50 md:max-w-75">
                                            {data.asset_photo_path ? data.asset_photo_path.name : "Choose physical image file..."}
                                        </span>
                                        <Upload className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={e => setData('asset_photo_path', e.target.files ? e.target.files[0] : null)}
                                        />
                                    </label>
                                </div>
                                {errors.asset_photo_path && <span className="text-xs text-rose-500 font-medium">{errors.asset_photo_path}</span>}
                            </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100">
                            <Link 
                                href="/my-assets" 
                                className="inline-flex items-center cursor-pointer gap-1 px-4 py-2 text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" /> Cancel
                            </Link>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center cursor-pointer gap-1.5 px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" /> Create Document
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}

CreateAsset.layout = {
    breadcrumbs: [
        {
            title: 'Log Asset',
            href: createAsset(),
        },
    ],
};