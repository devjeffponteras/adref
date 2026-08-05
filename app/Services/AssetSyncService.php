<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetApproval;
use App\Models\AssetStatus;
use App\Models\TemporaryAssetRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AssetSyncService
{
    /**
     * Synchronize a single asset with the remote workflow API.
     */
    public function syncAssetStatus(Asset $asset): array
    {
        $assetStatusData = [];

        if ($asset->manager_information && $asset->accounting_information?->asset_number) {
            $apiUrl = 'http://172.16.20.28/PMC-WFS/public/api/asset_getInfo/' . $asset->accounting_information->asset_number;

            try {
                $response = Http::timeout(10)->get($apiUrl);
                if ($response->successful()) {
                    $data = $response->json();
                    $assetStatusData = $data['asset_status'] ?? [];
                }
            } catch (\Exception $e) {
                Log::error("Asset Status API Error for Asset ID {$asset->id}: " . $e->getMessage());
            }
        }

        $remoteStatus = data_get($assetStatusData, 'status') ?? data_get($assetStatusData, '0.status');
        $isAlreadyApprovedLocally = strtoupper($asset->asid_information?->status ?? '') === 'APPROVED';
        $isAlreadyApprovedAsset = strtoupper($asset->status ?? '') === 'COMPLETED';

        if (
            $asset->manager_information &&
            $isAlreadyApprovedLocally &&
            !$isAlreadyApprovedAsset &&
            strtoupper((string) $remoteStatus) === 'FULLY APPROVED'
        ) {
            $this->completeAssetLocally($asset);
        }

        return $assetStatusData;
    }

    /**
     * Synchronize temporary asset requests that are currently in 'Pending' status.
     * Fetches details using 'transid' from the workflow API and updates local records if status changes.
     */
    public function syncPendingTemporaryAssetRequests(): array
    {
        $updatedCount = 0;
        $failedCount = 0;

        // Fetch ONLY pending items to conserve memory and DB bandwidth
        $pendingRequests = TemporaryAssetRequest::where('status', 'Pending')
            ->whereNotNull('refno')
            ->get();

        foreach ($pendingRequests as $tempRequest) {
            $apiUrl = 'http://172.16.20.28/PMC-WFS/public/api/asset_getInfo/' . $tempRequest->refno;

            try {
                $response = Http::timeout(10)->get($apiUrl);

                if ($response->successful()) {
                    $data = $response->json();
                    $assetStatusData = $data['asset_status'] ?? [];

                    // Safely extract status from API response object or array
                    $remoteStatus = data_get($assetStatusData, 'status') 
                        ?? data_get($assetStatusData, '0.status');

                    if ($remoteStatus) {
                        $normalizedRemoteStatus = strtoupper((string) $remoteStatus);

                        if ($normalizedRemoteStatus === 'FULLY APPROVED') {
                            DB::transaction(function () use ($tempRequest, $assetStatusData) {

                            $tempRequest->update([
                                    'status'     => 'APPROVED',
                                    'updated_at' => now(),
                                ]);


                                $assetData = [
                                    'accountable_personnel'   => $tempRequest->accountable_personnel ?? data_get($assetStatusData, 'accountable_personnel'),
                                    'model'                   => $tempRequest->model ?? data_get($assetStatusData, 'model'),
                                    'brand_make'              => $tempRequest->brand_make ?? data_get($assetStatusData, 'brand_make'),
                                    'serial_plate_id_number'  => $tempRequest->serial_plate_id_number ?? data_get($assetStatusData, 'serial_plate_id_number'),
                                    'end_user_department'     => $tempRequest->end_user_department ?? data_get($assetStatusData, 'end_user_department'),
                                    'asset_classification_id' => $tempRequest->asset_classification_id ?? data_get($assetStatusData, 'asset_classification_id'),
                                    'others_description'      => $tempRequest->others_description ?? data_get($assetStatusData, 'others_description'),
                                    'asset_location'          => $tempRequest->asset_location ?? data_get($assetStatusData, 'asset_location'),
                                    'description'             => $tempRequest->description ?? data_get($assetStatusData, 'description'),
                                    'reasons_for_disposal'    => $tempRequest->reasons_for_disposal ?? data_get($assetStatusData, 'reasons_for_disposal'),
                                    
                                    // Retain original requestor ID even in background execution
                                    'user_id'                 => $tempRequest->user_id ?? auth()->id() ?? 1,
                                    'status'                  => 'Pending',
                                    'control_number'          => null,

                                    'assessment_reports'      => $tempRequest->assessment_reports ?? data_get($assetStatusData, 'assessment_reports'),
                                    'asset_photos'            => $tempRequest->asset_photos ?? data_get($assetStatusData, 'asset_photos'),
                                ];

                                $asset = Asset::create($assetData);

                                for ($i = 1; $i <= 7; $i++) {
                                    $asset->approvals()->create([
                                        'seq_no'        => $i,
                                        'is_current'    => ($i === 1),
                                        'status'        => ($i === 1) ? 'On-going' : 'Pending',
                                        'approver_id'   => null,
                                        'approval_date' => null,
                                        'remarks'       => null,
                                    ]);
                                }

                                AssetStatus::create([
                                    'asset_id'      => $asset->id,
                                    'seq_no'        => 1,
                                    'status'        => 'Pending',
                                    'approver_id'   => null,
                                    'approval_date' => null,
                                    'remarks'       => 'Asset initialized in the inventory tracking system. Control Number Pending for Assignment.',
                                ]);
                            });

                            $updatedCount++;
                        } elseif (strcasecmp((string) $tempRequest->status, (string) $remoteStatus) !== 0) {
                            // Update status if remote status changed (e.g., REJECTED / DISAPPROVED)
                            $tempRequest->update([
                                'status'     => $remoteStatus,
                                'updated_at' => now(),
                            ]);

                            $updatedCount++;
                        }
                    }
                } else {
                    Log::warning("API returned HTTP {$response->status()} for Temporary Asset refno: {$tempRequest->refno}");
                }
            } catch (\Exception $e) {
                $failedCount++;
                Log::error("Failed to sync Temporary Asset Request (refno: {$tempRequest->refno}): " . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        return [
            'total_pending_processed' => $pendingRequests->count(),
            'updated'                 => $updatedCount,
            'failed'                  => $failedCount,
        ];
    }

    /**
     * Execute the local DB updates when marked as fully approved.
     */
    protected function completeAssetLocally(Asset $asset): void
    {
        DB::beginTransaction();

        try {
            $approvals = AssetApproval::where('asset_id', $asset->id)
                ->orderBy('seq_no', 'asc')
                ->get();

            if ($approvals->isEmpty()) {
                throw new \Exception("No approval workflow found for Asset ID {$asset->id}.");
            }

            $lastApproval = $approvals->last();
            $currentUserId = Auth::id() ?? 1; // Fallback to system user if running in background task

            // Update prior steps
            AssetApproval::where('asset_id', $asset->id)
                ->where('id', '!=', $lastApproval->id)
                ->update([
                    'is_current'    => false,
                    'status'        => 'Approved',
                    'approver_id'   => $currentUserId,
                    'approval_date' => now(),
                    'remarks'       => $asset->manager_information->remarks ?? null,
                ]);

            // Update final step
            $lastApproval->update([
                'is_current'    => true,
                'status'        => 'Completed',
                'approver_id'   => $currentUserId,
                'approval_date' => now(),
                'remarks'       => $asset->manager_information->remarks ?? null,
            ]);

            // Update asset record
            $asset->update([
                'status' => 'Completed',
            ]);

            // Update asset status tracking
            AssetStatus::where('asset_id', $asset->id)
                ->update([
                    'seq_no'        => $lastApproval->seq_no,
                    'status'        => 'Approved',
                    'approver_id'   => $currentUserId,
                    'approval_date' => now(),
                    'remarks'       => $asset->manager_information->remarks ?? null,
                ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed transaction sequence processing accounting evaluation for Asset ID {$asset->id}: " . $e->getMessage());
            throw $e;
        }
    }
}