<?php

namespace App\Http\Controllers;

use App\Models\AssetClassification;
use App\Models\Asset;
use App\Models\AssetApproval;
use App\Models\assetStatus;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssetController extends Controller
{
    /**
     * Display a listing of the end user's personal assets.
     */
    public function myAssets(): Response
    {
        $myAssets = Asset::where('user_id', auth()->id())
            ->with('classification')
            ->get();

        return Inertia::render('my-assets', [
            'assets' => $myAssets
        ]);
    }

    /**
     * Display a listing of all assets for disposals to admins view
     */
    public function disposals(): Response
    {
        $myAssets = Asset::with('classification')->get();

        return Inertia::render('disposals', [
            'assets' => $myAssets
        ]);
    }

    /**
     * Show the form for creating a new asset item.
     */
    public function create(): Response
    {
        $classifications = AssetClassification::where('is_active', true)
            ->select('id', 'name')
            ->get();

        return Inertia::render('create-asset', [
            'classifications' => $classifications
        ]);
    }

    /**
     * Store a newly created asset and initialize its tracking steps.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'accountable_personnel'   => 'required|string|max:255',
            'model'                   => 'nullable|string|max:255',
            'brand_make'              => 'nullable|string|max:255',
            'serial_plate_id_number'  => 'nullable|string|max:255',
            'end_user_department'     => 'required|string|max:255',
            'asset_classification_id' => 'required|exists:asset_classifications,id',
            'asset_location'          => 'nullable|string|max:255',
            'description'             => 'nullable|string',
            'reasons_for_disposal'    => 'nullable|string', 
            'assessment_report_path'  => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'asset_photo_path'        => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'Pending';

        // 1. GENERATE DYNAMIC CONTROL NUMBER
        // Format: AD-26-XXXXX (AD + 2-digit Year + 5-digit daily microtime seed)
        $prefix = 'AD-' . date('y') . '-';
        $uniqueSeed = substr(time(), -5) . sprintf('%02d', rand(0, 99)); // Highly unique, compact time suffix
        $validated['control_number'] = $prefix . $uniqueSeed;

        // File handler mapping
        if ($request->hasFile('assessment_report_path')) {
            $validated['assessment_report_path'] = $request->file('assessment_report_path')->store('reports', 'public');
        }
        if ($request->hasFile('asset_photo_path')) {
            $validated['asset_photo_path'] = $request->file('asset_photo_path')->store('photos', 'public');
        }

        // Use a database transaction to ensure data consistency across tables
        DB::transaction(function () use ($validated) {
            
            // 2. Create the primary asset record entry row (now includes control_number)
            $asset = Asset::create($validated);

            // 3. Automatically seed the 8 pipeline stages sequentially for this asset instance
            for ($i = 1; $i <= 8; $i++) {
                $asset->approvals()->create([
                    'seq_no'        => $i,
                    'is_current'    => ($i === 1),                     
                    'status'        => ($i === 1) ? 'On-going' : 'Pending', 
                    'approver_id'   => null,
                    'approval_date' => null,
                    'remarks'       => null,
                ]);
            }

            // 4. PARALLEL SAVE: Initialize the first tracking record in the asset_statuses table
            AssetStatus::create([
                'asset_id'      => $asset->id,
                'seq_no'        => 1,
                'is_current'    => true,
                'status'        => 'Pending', 
                'approver_id'   => null,
                'approval_date' => null,
                'remarks'       => 'Asset initialized in the inventory tracking system with Control No: ' . $asset->control_number,
            ]);
        });

        return redirect()->route('my-assets')->with('success', 'Asset logged and tracking sequence initialized successfully!');
    }
    
    /**
     * Render the vertical timeline view page with tracking status elements.
     */
    public function assetStatus($id): Response
    {
        $asset = Asset::with([
            'approvals' => function ($query) {
                $query->orderBy('seq_no', 'asc');
            },
            'assetStatuses' => function ($query) {
                $query->orderBy('seq_no', 'desc'); // Often useful to see the newest status updates first
            },
            'user' // Connects the User model data via the asset's user_id foreign key
        ])->findOrFail($id);

        // dd($asset->toArray());
        
        return Inertia::render('asset-status', [
            'asset' => $asset
        ]);
    }

    /**
     * Handle processing the authorization signing action for the active sequence stage.
     */
    public function assetApprove(Request $request, $id)
    {
        $request->validate([
            'remarks' => 'nullable|string|max:1000'
        ]);

        // Find the active approval tracking row belonging to this asset
        $currentApproval = AssetApproval::where('asset_id', $id)
            ->where('is_current', true)
            ->firstOrFail();

        // 1. Finalize the active step using your precise schema columns
        $currentApproval->update([
            'is_current'    => false,
            'status'        => 'Approved',
            'approver_id'   => auth()->id(), // Binds the authenticated user ID
            'approval_date' => now(),
            'remarks'       => $request->remarks
        ]);

        // 2. Identify the subsequent step row based on sequential routing numbers
        $nextApproval = AssetApproval::where('asset_id', $id)
            ->where('seq_no', $currentApproval->seq_no + 1)
            ->first();

        if ($nextApproval) {
            // Wake up the next department in line sequence workflow
            $nextApproval->update([
                'is_current' => true,
                'status'     => 'On-going'
            ]);
        } else {
            // No more stages left in sequence; flag primary global asset profile complete
            Asset::where('id', $id)->update(['status' => 'Completed']);
        }

        return redirect()->back()->with('success', 'Stage authorization processed successfully.');
    }

    public function asidEvaluate($id): Response
    {
        $asset = \App\Models\Asset::findOrFail($id);

        return Inertia::render('asid/evaluate', [
            'asset' => $asset
        ]);
    }
}