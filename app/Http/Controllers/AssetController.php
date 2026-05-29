<?php

namespace App\Http\Controllers;

use App\Models\AssetClassification;
use App\Models\Asset;
use App\Models\AssetApproval;
use App\Models\AssetStatus;
use App\Models\AccountingInformation;
use App\Models\McdInformation;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

        return Inertia::render('user/create-asset', [
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

        // dd($request->toArray());

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'Pending';
        $validated['control_number'] = null;

        // File handler mapping
        if ($request->hasFile('assessment_report_path')) {
            $validated['assessment_report_path'] = $request->file('assessment_report_path')->store('reports', 'public');
        }
        if ($request->hasFile('asset_photo_path')) {
            $validated['asset_photo_path'] = $request->file('asset_photo_path')->store('photos', 'public');
        }

        // Use a database transaction to ensure data consistency across tables
        DB::transaction(function () use ($validated) {
            
            $asset = Asset::create($validated);

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

            AssetStatus::create([
                'asset_id'      => $asset->id,
                'seq_no'        => 1,
                'status'        => 'Pending', 
                'approver_id'   => null,
                'approval_date' => null,
                'remarks'       => 'Asset initialized in the inventory tracking system. Control Number Pending for Assignment.',
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
            // 'assetStatuses' => function ($query) {
            //     $query->orderBy('seq_no', 'desc'); // Often useful to see the newest status updates first
            // },
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

        $currentApproval->update([
            'is_current'    => false,
            'status'        => 'Approved',
            'approver_id'   => auth()->id(), // Binds the authenticated user ID
            'approval_date' => now(),
            'remarks'       => $request->remarks
        ]);

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

        // update individual asset status
        AssetStatus::where('asset_id', $id)->update([
            'seq_no'        => $currentApproval->seq_no + 1,
            // 'is_current'    => true,
            'role'          => 'asid', 
            'status'        => 'On-going', 
            'approver_id'   => Auth::id(),
            'approval_date' => now(),
            'remarks'       => 'Asset initialized in the inventory tracking system. Control Number Pending Assignment.',
        ]);

        return redirect()->back()->with('success', 'Stage authorization processed successfully.');
    }

    public function asidEvaluate($id): Response
    {
        $asset = \App\Models\Asset::findOrFail($id);

        return Inertia::render('asid/evaluate', [
            'asset' => $asset
        ]);
    }

    public function asidViewAsset($id)
    {
        $asset = Asset::with(['user', 'classification'])->findOrFail($id);
        // dd($asset->toArray());
        return Inertia::render('asid/view', [
            'asset' => $asset
        ]);
        
    }

    public function asidViewAssetAction(Request $request, $id)
    {
        $validated = $request->validate([
            'status'         => 'required|in:Approved,Returned,Rejected',
            'remarks'        => 'required|string|min:5|max:1000',
            'control_number' => 'required_if:status,Approved|nullable|string|max:255',
        ]);

        $asset = Asset::findOrFail($id);

        DB::transaction(function () use ($asset, $validated) {
            
            $currentApproval = $asset->approvals()->where('is_current', true)->first();
            $currentSeq = $currentApproval ? $currentApproval->seq_no : 1;

            $assetUpdate = ['status' => $validated['status']];
            if ($validated['status'] === 'Approved' && array_key_exists('control_number', $validated)) {
                $assetUpdate['control_number'] = $validated['control_number'];
            }
            $asset->update($assetUpdate);

            $asset->approvals()->where('seq_no', $currentSeq)->update([
                'is_current'    => false,                     
                'status'        => $validated['status'], 
                'approver_id'   => Auth::id(),
                'approval_date' => now(),
                'remarks'       => $validated['remarks'],
            ]);

            $targetActiveSeq = $currentSeq;

            if ($validated['status'] === 'Approved' && $currentSeq < 8) {
                $targetActiveSeq = $currentSeq + 1;
                
                $asset->approvals()->where('seq_no', $targetActiveSeq)->update([
                    'is_current'    => true,
                    'status'        => 'On-going', 
                    'approver_id'   => null,
                    'approval_date' => null,
                    'remarks'       => null,
                ]);
            }
            elseif ($validated['status'] === 'Returned') {
                $targetActiveSeq = 1; // Send back to step 1
                
                $asset->approvals()->where('seq_no', $targetActiveSeq)->update([
                    'is_current'    => true,
                    'status'        => 'On-going',
                    'approver_id'   => null,
                    'approval_date' => null,
                    'remarks'       => null,
                ]);
            } 
            elseif ($validated['status'] === 'Rejected') {
                $targetActiveSeq = $currentSeq;
            }

            // Log details explicitly onto the row the user just interacted with
            AssetStatus::where('asset_id', $asset->id)
                ->update([
                    'seq_no'        => $targetActiveSeq,
                    'status'        => $validated['status'],
                    'approver_id'   => Auth::id(),
                    'approval_date' => now(),
                    'remarks'       => $validated['remarks'],
                ]);
        });

        return redirect()->route('asid-dashboard')->with('success', "Asset application state updated to: {$validated['status']}.");
    }

    public function accountingEvaluate($id) {
        $asset = Asset::with(['user', 'classification', 'accounting_information'])->findOrFail($id);

        return Inertia::render('accounting/evaluate', [
            'asset' => $asset
        ]);
       
    }

    public function accountingevaluateAction(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);

        $validatedData = $request->validate([
            'asset_number'     => 'required|string|max:100|unique:accounting_information,asset_number,' . $asset->id . ',asset_id',
            'acquisition_date' => 'required|date',
            'acquisition_cost' => 'required|numeric|min:0',
            'book_value'       => 'required|numeric|min:0',
            'remarks'          => 'nullable|string|max:1000',
            'checked_by'       => 'required|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            AccountingInformation::updateOrCreate(
                ['asset_id' => $asset->id],
                [
                    'role'             => 'accounting',
                    'asset_number'     => $validatedData['asset_number'],
                    'acquisition_date' => $validatedData['acquisition_date'],
                    'acquisition_cost' => $validatedData['acquisition_cost'],
                    'book_value'       => $validatedData['book_value'],
                    'remarks'          => $validatedData['remarks'],
                    'checked_by'       => $validatedData['checked_by'],
                    'conformed_by'     => 'N/A',
                    'status'           => 'Approved',
                    'approver_id'      => Auth::id(),
                ]
            );

            $currentApproval = AssetApproval::where('asset_id', $id)
                ->where('is_current', true)
                ->firstOrFail();

            $currentApproval->update([
                'is_current'    => false,
                'status'        => 'Approved',
                'approver_id'   => Auth::id(), 
                'approval_date' => now(),
                'remarks'       => $validatedData['remarks']
            ]);

            $nextApproval = AssetApproval::where('asset_id', $id)
                ->where('seq_no', $currentApproval->seq_no + 1)
                ->first();

            if ($nextApproval) {
                $nextApproval->update([
                    'is_current' => true,
                    'status'     => 'On-going'
                ]);

                $asset->update([
                    'status' => 'On-going' 
                    // 'status' => 'pending_workflow_approval' // mao ni if goods na ang WORKFLOW vice versa connection! eyy!! then add og algo for WORKFLOW app
                ]);

                $message = "Accounting details recorded. Asset evaluation successfully advanced to the next sequence.";
            } else {
                $asset->update([
                    'status' => 'Completed'
                ]);

                $message = "Accounting details recorded. All tracking sequence steps complete; asset pipeline marked as Completed.";
            }

            AssetStatus::where('asset_id', $asset->id)
                        ->update([
                            'seq_no'        => $currentApproval->seq_no + 1,
                            'status'        => 'On-going',
                            'approver_id'   => Auth::id(),
                            'approval_date' => now(),
                            'remarks'       => $validatedData['remarks'],
                        ]);

            DB::commit();

            return redirect()->route('accounting-dashboard')
                ->with('success', $message);

        } catch (\Exception $e) {
            // Discard all table queries cleanly if anything goes wrong
            DB::rollBack();

            Log::error("Failed transaction sequence processing accounting evaluation for Asset ID {$id}: " . $e->getMessage());

            return back()->withErrors([
                'error' => 'An operational database issue halted processing your asset updates. Please try again.'
            ]);
        }
    }

    public function mcdEvaluate($id) {
        $asset = Asset::with(['user', 'classification', 'accounting_information', 'mcd_information'])->findOrFail($id);

        return Inertia::render('mcd/evaluate', [
            'asset' => $asset
        ]);
       
    }

    public function mcdEvaluateAction(Request $request, $id) {

        // dria nako..
        $asset = Asset::findOrFail($id);

        $validatedData = $request->validate([
            'par_number'          => 'nullable|string|max:1000',
            'par_remarks'          => 'nullable|string|max:1000',
        ]);

        // dd(auth()->user()?->role?->name);

        DB::beginTransaction();

        try {

            McdInformation::updateOrCreate(
                ['asset_id' => $asset->id],
                [
                    'role'        => 'mcd',
                    'par_number'  => $validatedData['par_number'],
                    'remarks'     => $validatedData['par_remarks'],
                    'approver_id' => Auth::id(),
                    'status'      => 'Approved',
                ]
            );

            $currentApproval = AssetApproval::where('asset_id', $id)
                ->where('is_current', true)
                ->firstOrFail();

            $currentApproval->update([
                'is_current'    => false,
                'status'        => 'Approved',
                'approver_id'   => Auth::id(), 
                'approval_date' => now(),
                'remarks'       => $validatedData['par_remarks']
            ]);

            AssetStatus::where('asset_id', $asset->id)
                ->update([
                    'seq_no'        => $currentApproval->seq_no,
                    'status'        => 'Approved', 
                    'approver_id'   => Auth::id(),
                    'approval_date' => now(),
                    'remarks'       => $validatedData['par_remarks'],
                ]);

            $nextApproval = AssetApproval::where('asset_id', $id)
                ->where('seq_no', $currentApproval->seq_no + 1)
                ->first();

            if ($nextApproval) {
                $nextApproval->update([
                    'is_current' => true,
                    'status'     => 'On-going'
                ]);

                $asset->update([
                    'status' => 'On-going' 
                ]);

                $message = "MCD Phase tracking details logged. Asset evaluation advanced to the next milestone sequence.";
            } else {
                $asset->update([
                    'status' => 'Completed'
                ]);

                $message = "MCD Phase tracking details logged. All tracking sequence steps complete; asset pipeline marked as Completed.";
            }

            DB::commit();

            return redirect()->route('mcd-dashboard')
                ->with('success', $message);

        } catch (\Exception $e) {
            // Rollback all pending queries clean if something crashes mid-execution
            DB::rollBack();

            Log::error("Failed transaction sequence processing MCD evaluation for Asset ID {$id}: " . $e->getMessage());

            return back()->withErrors([
                'error' => 'An operational database issue halted processing your MCD updates. Please try again.'
            ]);
        }

    }
}