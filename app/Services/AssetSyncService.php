<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetApproval;
use App\Models\AssetStatus;
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