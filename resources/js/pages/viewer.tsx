import { Head } from '@inertiajs/react';
import { 
  Calculator, 
  ClipboardCheck, 
  FileCheck2, 
  FileText, 
  ShieldAlert, 
  UserCheck 
} from 'lucide-react';
import { AssetProfileCard } from '@/components/asset-profile-card';
import type { Asset } from '@/types/models';

interface Props {
  asset: Asset | null;
}

export default function Viewer({ asset }: Props) {
  // Helper for empty string or null values inside existing sections
  const renderValue = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') {
      return <span className="font-normal italic text-zinc-400">N/A</span>;
    }
    return value;
  };

  // Define section configuration paired with their source objects
  const rawSections = [
    {
      title: 'Accounting',
      icon: Calculator,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      sourceObject: asset?.accounting_information,
      data: [
        { label: 'Book Value', value: asset?.accounting_information?.book_value },
        { label: 'Acquisition Cost', value: asset?.accounting_information?.acquisition_cost },
        { label: 'Checked By', value: asset?.accounting_information?.checked_by },
        { label: 'Remarks', value: asset?.accounting_information?.remarks, fullWidth: true },
      ],
    },
    {
      title: 'MCD Evaluator',
      icon: ClipboardCheck,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      sourceObject: asset?.mcd_information,
      data: [
        { label: 'PAR Number', value: asset?.mcd_information?.par_number },
        { label: 'Remarks', value: asset?.mcd_information?.remarks, fullWidth: true },
        { label: "Manager's Remarks", value: asset?.mcd_information?.manager_remarks, fullWidth: true },
      ],
    },
    {
      title: 'MEPEO',
      icon: ShieldAlert,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      sourceObject: asset?.mepeo_information,
      data: [
        { label: 'Waste Classification', value: asset?.mepeo_information?.waste_classification?.name },
        { label: 'Characteristics & Form', value: asset?.mepeo_information?.waste_characteristic?.name },
        { label: 'Remarks', value: asset?.mepeo_information?.remarks, fullWidth: true },
      ],
    },
    {
      title: 'ASID Evaluator',
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      sourceObject: asset?.asid_information,
      data: [
        { label: 'Reviewed & Noted By', value: asset?.asid_information?.reviewed_by },
        { label: 'Remarks', value: asset?.asid_information?.remarks, fullWidth: true },
      ],
    },
    {
      title: 'ASID Manager',
      icon: UserCheck,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      sourceObject: asset?.manager_information,
      data: [
        { label: 'Reviewed & Noted By', value: asset?.manager_information?.manager_reviewd_by },
        { label: 'Disposition / Remarks', value: asset?.manager_information?.manager_disposition, fullWidth: true },
      ],
    },
  ];

  // Filter out sections where the main source object is missing or null
  const activeSections = rawSections.filter(
    (section) => section.sourceObject !== null && section.sourceObject !== undefined
  );

  return (
    <>
        <Head title="Viewer - Asset Transaction Details" />

        {/* Centered, styled Header Section */}
        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-2 shadow-sm border border-zinc-200/80">
            <img 
            src="/images/logo/pmc-logo-solo.png" 
            alt="PMC Logo" 
            className="h-full w-full object-contain" 
            />
        </div>
        <h1 className="text-xl font-bold tracking-wide text-zinc-700 sm:text-2xl">
            PMC - ADREF SYSTEM
        </h1>
        </div>

        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Asset Profile Header */}
        {asset ? (
            <AssetProfileCard asset={asset} />
        ) : (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 shadow-sm">
            No asset details available.
            </div>
        )}

        {/* Evaluation Details Card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
            <div className="flex items-center gap-2.5">
                <div className="rounded-lg border border-zinc-200/80 bg-white p-2 text-zinc-700 shadow-xs">
                <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                <h3 className="text-base font-semibold text-zinc-900">Evaluation Details</h3>
                <p className="text-xs text-zinc-500">Comprehensive multi-department review summary</p>
                </div>
            </div>
            </div>

            {/* Card Body - Render only active sections */}
            {activeSections.length > 0 ? (
            <div className="divide-y divide-zinc-100">
                {activeSections.map((section, idx) => {
                const Icon = section.icon;
                return (
                    <div key={idx} className="p-6 transition-colors hover:bg-zinc-50/30">
                    {/* Section Title */}
                    <div className="mb-4 flex items-center gap-2">
                        <span className={`rounded-md border p-1.5 text-xs font-medium ${section.color}`}>
                        <Icon className="h-4 w-4" />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        {section.title}
                        </h4>
                    </div>

                    {/* Data Grid */}
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                        {section.data.map((item, itemIdx) => (
                        <div 
                            key={itemIdx} 
                            className={item.fullWidth ? 'sm:col-span-2 md:col-span-3' : 'col-span-1'}
                        >
                            <dt className="mb-0.5 text-xs font-medium text-zinc-400">
                            {item.label}
                            </dt>
                            <dd className="text-sm font-semibold leading-relaxed text-zinc-800">
                            {renderValue(item.value)}
                            </dd>
                        </div>
                        ))}
                    </dl>
                    </div>
                );
                })}
            </div>
            ) : (
            <div className="p-8 text-center text-sm text-zinc-500">
                No evaluation sections are available for this asset yet.
            </div>
            )}
        </div>
        </div>
    </>
    );
}

Viewer.layout = {
  breadcrumbs: [
    {
      title: 'Viewer',
    },
  ],
};