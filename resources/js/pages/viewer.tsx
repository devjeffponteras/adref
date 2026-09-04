import { Head } from '@inertiajs/react';
import {
  Calculator,
  ClipboardCheck,
  FileCheck2,
  FileText,
  ShieldAlert,
  UserCheck,
  Eye,
} from 'lucide-react';
import { AssetProfileCard } from '@/components/asset-profile-card';
import type { Asset } from '@/types/models';

interface TemporaryAssetData {
  id?: string | number | null;
  refno?: string | null;
  transid?: string | null;
  status?: string | null;
  control_number?: string | null;
  user_id?: string | number | null;
  accountable_personnel?: string | null;
  model?: string | null;
  brand_make?: string | null;
  serial_plate_id_number?: string | null;
  end_user_department?: string | null;
  asset_classification_id?: string | number | null;
  others_description?: string | null;
  asset_location?: string | null;
  description?: string | null;
  reasons_for_disposal?: string | null;
  assessment_reports?: unknown;
  asset_photos?: unknown;
  created_at?: string | null;
  updated_at?: string | null;
  user?: User | null;
}

interface User {
  id?: number | null;
  name?: string | null;
}

interface Props {
  asset: Asset | null;
  is_temp?: TemporaryAssetData | null;
}

const parseJsonArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function Viewer({ asset, is_temp }: Props) {
  const renderValue = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') {
      return <span className="font-normal italic text-zinc-400">N/A</span>;
    }
    return value;
  };

  const temporaryAssetProfile = is_temp
    ? ({
        id: Number(is_temp.id ?? 0),
        control_number: is_temp.control_number ?? null,
        accountable_personnel: is_temp.accountable_personnel ?? 'N/A',
        model: is_temp.model ?? null,
        brand_make: is_temp.brand_make ?? null,
        description: is_temp.description ?? null,
        serial_plate_id_number: is_temp.serial_plate_id_number ?? null,
        end_user_department: is_temp.end_user_department ?? null,
        asset_location: is_temp.asset_location ?? null,
        reasons_for_disposal: is_temp.reasons_for_disposal ?? null,
        status: is_temp.status ?? 'Pending',
        assessment_reports: parseJsonArray(is_temp.assessment_reports),
        asset_photos: parseJsonArray(is_temp.asset_photos),
        user: is_temp.user?.name,
        classification: undefined,
        asset_classification_id: null,
      } as Asset)
    : null;

  const displayAsset = asset ?? temporaryAssetProfile;
  const managerInfo = asset?.manager_information;

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
        { label: 'Checked By', value: asset?.asid_information?.checked_by },
        { label: 'Remarks', value: asset?.asid_information?.remarks, fullWidth: true },
      ],
    },
    {
      title: 'ASID Manager',
      icon: UserCheck,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      sourceObject: asset?.manager_information,
      data: [
        { label: 'Reviewed & Noted By', value: asset?.manager_information?.reviewed_by },
        ...(managerInfo && managerInfo.bidding_price != null && managerInfo.bidding_price > 0
          ? [{ label: 'Bidding Price', value: `Php ${managerInfo.bidding_price}` }]
          : []),
        { label: 'Disposition', value: asset?.manager_information?.asset_direction, fullWidth: true },
      ],
    },
  ];

  const activeSections = rawSections.filter(
    (section) => section.sourceObject !== null && section.sourceObject !== undefined,
  );

  return (
    <>
      <Head title="Viewer - Asset Transaction Details" />

      <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-200/80 bg-white p-2 shadow-sm">
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
        {is_temp && !asset && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700/80">
                  Temporary Asset Request
                </p>
                <h2 className="mt-1 text-lg font-bold text-zinc-800">
                  {is_temp.accountable_personnel || 'Temporary Asset Request'}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-amber-200 bg-white px-2.5 py-1 font-semibold text-amber-700">
                  {is_temp.status || 'Pending'}
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-zinc-600">
                  {is_temp.transid || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {displayAsset ? (
          <AssetProfileCard asset={displayAsset} />
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-zinc-500 shadow-sm">
            No asset details available.
          </div>
        )}

        {asset && activeSections.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
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

            <div className="divide-y divide-zinc-100">
              {activeSections.map((section, idx) => {
                const Icon = section.icon;

                return (
                  <div key={idx} className="p-6 transition-colors hover:bg-zinc-50/30">
                    <div className="mb-4 flex items-center gap-2">
                      <span className={`rounded-md border p-1.5 text-xs font-medium ${section.color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        {section.title}
                      </h4>
                    </div>

                    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                      {section.data.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className={item.fullWidth ? 'sm:col-span-2 md:col-span-3' : 'col-span-1'}
                        >
                          <dt className="mb-0.5 text-xs font-medium text-zinc-400">{item.label}</dt>
                          <dd className="text-sm font-semibold leading-relaxed text-zinc-800">
                            {renderValue(item.value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                      {section.title === 'MCD Evaluator' && asset.mcd_information?.photo && (
                        <button
                          type="button"
                          onClick={() => window.open(`/storage/${asset.mcd_information?.photo}`, '_blank', 'noopener,noreferrer')}
                          className="mt-5 inline-flex items-center rounded-lg border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Photo
                        </button>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
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