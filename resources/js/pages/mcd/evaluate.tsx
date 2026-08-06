import { Head, Link, useForm, router } from '@inertiajs/react';
import { XIcon, CircleCheck, ArrowLeftCircle, Send } from 'lucide-react';
import { AssetProfileCard } from '@/components/asset-profile-card';
import React, { useState, useEffect, useRef } from 'react';

interface User {
    id: number;
    name: string;
}

interface AssetClassification {
    id: number;
    name: string;
}

interface McdInformation {
    id: number;
    asset_id: number;
    par_number: string;
    remarks: string;
}

interface AccountingInformation {
    id: number;
    asset_id: number;
    asset_number: string;
    acquisition_date: string;
    acquisition_cost: string;
    book_value: string;
    remarks: string;
}

interface AssetData {
    id: number;
    user_id: number;
    control_number: string;
    accountable_personnel: string;
    model: string;
    description: string;
    brand_make: string;
    serial_plate_id_number: string;
    end_user_department: string;
    asset_classification_id: number;
    reasons_for_disposal: string;
    asset_location: string;
    status: string;
    assessment_report_path: string | null;
    asset_photo_path: string | null;
    created_at: string;
    user?: User;
    classification?: AssetClassification;
    accounting_information?: AccountingInformation | null;
    mcd_information?: McdInformation | null;
}

interface ParNumberItem {
    header_id: string;
}

interface EvaluateProps {
    asset: AssetData;
    par_numbers?: ParNumberItem[];
}

const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString) {
        return '';
    }
    return dateString.split(' ')[0].split('T')[0];
};

export default function McdEvaluate({ asset, par_numbers = [] }: EvaluateProps) {
    const isLocked = !!asset.mcd_information;

    // Autocomplete State
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    // Initialize Inertia form hook with your fields
    const { data, setData, post, processing, errors } = useForm({
        asset_number: asset.accounting_information?.asset_number || '',
        acquisition_date: formatDateForInput(asset.accounting_information?.acquisition_date || ''),
        acquisition_cost: asset.accounting_information?.acquisition_cost ? String(asset.accounting_information.acquisition_cost) : '',
        book_value: asset.accounting_information?.book_value ? String(asset.accounting_information.book_value) : '',
        remarks: asset.accounting_information?.remarks || '',
        checked_by: 'Lou Agusin',
        conformed_by: '',

        par_number: asset.mcd_information?.par_number || '',
        par_remarks: asset.mcd_information?.remarks || '',
    });

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle input change and search query
    const handleParNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setData('par_number', value);

        if (isLocked) return;

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        if (value.trim().length >= 2) {
            setIsOpen(true);

            // Debounce to prevent sending requests on every single character keystroke
            searchDebounceRef.current = setTimeout(() => {
                router.get(
                    window.location.pathname,
                    { inputted: value.trim() },
                    {
                        preserveState: true,  // Keeps input state and focus intact
                        preserveScroll: true, // Prevents window jumps
                        only: ['par_numbers'], // Re-fetches ONLY par_numbers prop from Laravel
                    }
                );
            }, 300);
        } else {
            setIsOpen(false);
        }
    };

    const handleSelectPar = (selectedParNumber: string) => {
        setData('par_number', selectedParNumber);
        setIsOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/mcd-evaluate/${asset.id}/action`);
    };

    return (
        <>
            <Head title="Asset Evaluation - Accounting" />

            {/* main content */}
            <div className="container-fluid p-4">
                <AssetProfileCard asset={asset} />

                <div className="w-full bg-white border border-gray-200 rounded-xl shadow-xs p-6 my-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">
                        Accounting Information
                        <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                            <CircleCheck className="h-3 w-3 mr-1" />
                            Approved
                        </span>
                    </h2>

                    {/* First Row Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Asset Number</label>
                            <input
                                type="text"
                                placeholder="e.g. AD-26-01"
                                value={data.asset_number}
                                disabled
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150 ${
                                    asset.accounting_information
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                }`}
                            />
                            {errors.asset_number && <p className="text-xs text-red-500 mt-1">{errors.asset_number}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Acquisition Date</label>
                            <input
                                type="date"
                                value={data.acquisition_date}
                                disabled
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150 ${
                                    asset.accounting_information
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                }`}
                            />
                            {errors.acquisition_date && <p className="text-xs text-red-500 mt-1">{errors.acquisition_date}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Acquisition Cost</label>
                            <div className="relative flex items-stretch rounded-lg shadow-2xs">
                                <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">₱</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    disabled
                                    value={data.acquisition_cost}
                                    className={`w-full p-2 text-sm border shadow-2xs transition-colors duration-150 rounded-r-lg ${
                                        asset.accounting_information
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                    }`}
                                />
                            </div>
                            {errors.acquisition_cost && <p className="text-xs text-red-500 mt-1">{errors.acquisition_cost}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Book Value</label>
                            <div className="relative flex items-stretch rounded-lg shadow-2xs">
                                <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">₱</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={data.book_value}
                                    disabled
                                    className={`w-full p-2 text-sm border shadow-2xs transition-colors duration-150 rounded-r-lg ${
                                        asset.accounting_information
                                            ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                    }`}
                                />
                            </div>
                            {errors.book_value && <p className="text-xs text-red-500 mt-1">{errors.book_value}</p>}
                        </div>
                    </div>

                    {/* Second Row Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Remarks</label>
                            <input
                                type="text"
                                value={data.remarks}
                                disabled
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150 ${
                                    asset.accounting_information
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                }`}
                            />
                            {errors.remarks && <p className="text-xs text-red-500 mt-1">{errors.remarks}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Checked by</label>
                            <input
                                type="text"
                                disabled
                                value={data.checked_by}
                                className="w-full p-2 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed shadow-2xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Conformed by</label>
                            <input
                                type="text"
                                value={data.conformed_by}
                                disabled
                                className="w-full p-2 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed shadow-2xs"
                                placeholder="N/A for now.."
                            />
                            {errors.conformed_by && <p className="text-xs text-red-500 mt-1">{errors.conformed_by}</p>}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full bg-white border border-gray-200 rounded-xl shadow-xs p-6 my-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">
                        PAR Information
                        {isLocked && (
                            <span className="inline-flex items-center bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider float-right">
                                <CircleCheck className="h-3 w-3 mr-1" />
                                Approved
                            </span>
                        )}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* PAR Input with Autocomplete Container */}
                        <div className="relative" ref={wrapperRef}>
                            <label className="block text-xs font-bold text-gray-700 mb-1">PAR Number</label>
                            <input
                                type="text"
                                placeholder="Type PAR Number.."
                                value={data.par_number}
                                disabled={isLocked}
                                onChange={handleParNumberChange}
                                onFocus={() => {
                                    if (par_numbers.length > 0 && !isLocked) setIsOpen(true);
                                }}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150 ${
                                    isLocked
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                }`}
                            />

                            {/* Dropdown Options */}
                            {isOpen && par_numbers.length > 0 && !isLocked && (
                                <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {par_numbers.map((item, index) => (
                                        <li
                                            key={index}
                                            onMouseDown={(e) => {
                                                // Prevents input blur before selection completes
                                                e.preventDefault(); 
                                                handleSelectPar(item.header_id);
                                            }}
                                            className="p-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                        >
                                            {item.header_id}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* No Results Message */}
                            {isOpen && data.par_number.trim().length >= 2 && par_numbers.length === 0 && !isLocked && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-500 text-center">
                                    No matching PAR numbers found.
                                </div>
                            )}

                            {errors.par_number && <p className="text-xs text-red-500 mt-1">{errors.par_number}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Remarks</label>
                            <textarea
                                rows={3}
                                placeholder="Type Remarks.."
                                value={data.par_remarks}
                                disabled={isLocked}
                                onChange={e => setData('par_remarks', e.target.value)}
                                className={`w-full p-2 text-sm border rounded-lg shadow-2xs transition-colors duration-150 ${
                                    isLocked
                                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border-gray-300 focus:outline-emerald-500 focus:border-emerald-500'
                                }`}
                            ></textarea>
                            {errors.par_remarks && <p className="text-xs text-red-500 mt-1">{errors.par_remarks}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <div className="inline-flex items-center gap-3">
                            <Link
                                href="/mcd-dashboard"
                                className="inline-flex items-center cursor-pointer px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-hidden"
                            >
                                {isLocked ? <ArrowLeftCircle className="h-4 w-4 mr-1" /> : <XIcon className="h-4 w-4 mr-1" />}
                                {isLocked ? 'Back to Dashboard' : 'Cancel'}
                            </Link>

                            {!isLocked && (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center cursor-pointer px-4 py-2 bg-emerald-700 text-sm font-semibold text-white rounded-lg hover:bg-emerald-800 focus:outline-hidden"
                                >
                                    <Send className="h-5 w-5 mr-2" />
                                    Submit to <span className='text-amber-300 pl-2'>MCD MANAGER</span>
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                <br />
                <br />
                <br />
                <br />
            </div>
        </>
    );
}

McdEvaluate.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/mcd-dashboard',
        },
        {
            title: 'MCD - PAR Evaluation',
        },
    ],
};