<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Asset;
use App\Services\AssetSyncService;

class SyncPendingAssets extends Command
{
    // * * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1 // <-- mao ni ang entry pointing to Laravel installation para sa CRON JOB

    /**
     * The name and signature of the console command.
     * MUST match what you put in console.php
     */
    protected $signature = 'assets:sync-status';

    /**
     * The console command description.
     */
    protected $description = 'Sync active assets status from remote API';

    /**
     * Execute the console command.
     */
    public function handle(AssetSyncService $syncService): int
    {
        $this->info('Starting asset synchronization...');

        // Fetch only assets that are not completed yet
        $assets = Asset::where('status', '!=', 'Completed')
            ->whereHas('accounting_information')
            ->get();

        if ($assets->isEmpty()) {
            $this->info('No pending assets found to sync.');
            return Command::SUCCESS;
        }

        $count = 0;
        foreach ($assets as $asset) {
            try {
                $syncService->syncAssetStatus($asset);
                $count++;
            } catch (\Exception $e) {
                $this->error("Failed to sync Asset ID {$asset->id}: " . $e->getMessage());
            }
        }

        $this->info("Successfully processed {$count} asset(s).");

        return Command::SUCCESS;
    }
}
