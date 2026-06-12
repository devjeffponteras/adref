import { Head } from '@inertiajs/react';
import { Link, useForm } from '@inertiajs/react';
import { FileText, Plus, X, Upload } from 'lucide-react';
import React from 'react';
import SubHeader from '@/components/sub-header';
import { createAsset } from '@/routes';
import { ACCOUNTABLE_PERSONNEL, END_USER_DEPARTMENT } from '@config/dropdown_data';

interface Classification {
    id: number;
    name: string;
}

interface Props {
    classifications: Classification[];
}

// Interfaces for both multi-upload item formats
interface AssessmentReportItem {
    id: string;
    file: File | null;
}

interface AssetPhotoItem {
    id: string;
    file: File | null;
}

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Reliable fallback for insecure HTTP local network setups
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export default function CreateAsset({ classifications }: Props) {

    const { data, setData, post, processing, errors, reset } = useForm({
        accountable_personnel: '',
        model: '',
        description: '',
        brand_make: '',
        serial_plate_id_number: '',
        end_user_department: '',
        asset_classification_id: '', 
        reasons_for_disposal: '', 
        asset_location: '',
        
        // Dynamic array storage setups for both structural upload properties
        assessment_reports: [
            { id: generateUUID(), file: null } // 👈 Swapped here
        ] as AssessmentReportItem[],

        asset_photos: [
            { id: generateUUID(), file: null } // 👈 Swapped here
        ] as AssetPhotoItem[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/store-asset', {
            forceFormData: true,
            onSuccess: () => reset(
                'accountable_personnel', 'model', 'description', 
                'brand_make', 'serial_plate_id_number', 'end_user_department', 
                'asset_classification_id', 'reasons_for_disposal', 'asset_location', 
                'assessment_reports', 'asset_photos'
            ),
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
                        
                        {/* Form Inputs Grid System */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Accountable Personnel */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="accountable_personnel" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Accountable Personnel
                                </label>
                                <select
                                    id="accountable_personnel"
                                    value={data.accountable_personnel || ''}
                                    onChange={e => setData('accountable_personnel', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                >
                                    <option value="" disabled>Select personnel...</option>
                                    {ACCOUNTABLE_PERSONNEL.map((person) => (
                                        <option key={person.value} value={person.value}>
                                            {person.label}
                                        </option>
                                    ))}
                                </select>
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
                                <select
                                    id="end_user_department"
                                    value={data.end_user_department || ''}
                                    onChange={e => setData('end_user_department', e.target.value)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                >
                                    <option value="" disabled>Select personnel...</option>
                                    {END_USER_DEPARTMENT.map((person) => (
                                        <option key={person.value} value={person.value}>
                                            {person.label}
                                        </option>
                                    ))}
                                </select>
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

                        {/* File Attachments Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                            
                            {/* Document Attachment Section */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Assessment Reports
                                </label>

                                {data.assessment_reports.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <label className="flex-1 flex items-center justify-between border border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-lg px-4 py-2 cursor-pointer transition-colors group">
                                            <span className="text-sm text-gray-500 truncate max-w-50 md:max-w-75">
                                                {item.file ? item.file.name : `Choose assessment report #${index + 1}...`}
                                            </span>
                                            <Upload className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                onChange={e => {
                                                    const files = e.target.files;
                                                    const updatedReports = [...data.assessment_reports];
                                                    updatedReports[index].file = files ? files[0] : null;
                                                    setData('assessment_reports', updatedReports);
                                                }}
                                            />
                                        </label>

                                        {data.assessment_reports.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedReports = data.assessment_reports.filter(r => r.id !== item.id);
                                                    setData('assessment_reports', updatedReports);
                                                }}
                                                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {errors.assessment_reports && <span className="text-xs text-rose-500 font-medium">{errors.assessment_reports}</span>}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('assessment_reports', [
                                            ...data.assessment_reports,
                                            { id: crypto.randomUUID(), file: null }
                                        ]);
                                    }}
                                    className="w-fit text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1 transition-colors cursor-pointer"
                                >
                                    + Add More Reports
                                </button>
                            </div>

                            {/* Dynamic Photo Upload Field (UPDATED TO MULTI-UPLOAD) */}
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Photos of the Asset
                                </label>

                                {data.asset_photos.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <label className="flex-1 flex items-center justify-between border border-gray-200 bg-gray-50/50 hover:bg-gray-50 rounded-lg px-4 py-2 cursor-pointer transition-colors group">
                                            <span className="text-sm text-gray-500 truncate max-w-50 md:max-w-75">
                                                {item.file ? item.file.name : `Choose physical image file #${index + 1}...`}
                                            </span>
                                            <Upload className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="hidden" 
                                                onChange={e => {
                                                    const files = e.target.files;
                                                    const updatedPhotos = [...data.asset_photos];
                                                    updatedPhotos[index].file = files ? files[0] : null;
                                                    setData('asset_photos', updatedPhotos);
                                                }}
                                            />
                                        </label>

                                        {data.asset_photos.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedPhotos = data.asset_photos.filter(p => p.id !== item.id);
                                                    setData('asset_photos', updatedPhotos);
                                                }}
                                                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {errors.asset_photos && <span className="text-xs text-rose-500 font-medium">{errors.asset_photos}</span>}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('asset_photos', [
                                            ...data.asset_photos,
                                            { id: crypto.randomUUID(), file: null }
                                        ]);
                                    }}
                                    className="w-fit text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1 transition-colors cursor-pointer"
                                >
                                    + Add More Photos
                                </button>
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