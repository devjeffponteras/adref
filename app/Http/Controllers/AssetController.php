<?php

namespace App\Http\Controllers;

use App\Models\AccountingInformation;
use App\Models\AsidInformation;
use App\Models\Asset;
use App\Models\AssetApproval;
use App\Models\AssetBidding;
use App\Models\AssetClassification;
use App\Models\AssetStatus;
use App\Models\Bidding;
use App\Models\Form;
use App\Models\McdInformation;
use App\Models\MepeoInformation;
use App\Models\WasteCharacteristic;
use App\Models\WasteClassification;
use App\Models\Workflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

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
            'assets' => $myAssets,
        ]);
    }

    /**
     * Display a listing of all assets for disposals to admins view
     */
    public function disposals(): Response
    {
        $myAssets = Asset::with('classification')->get();

        return Inertia::render('disposals', [
            'assets' => $myAssets,
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
            'classifications' => $classifications,
            'accountable_personnels' => config('dropdown_data.ACCOUNTABLE_PERSONNEL'),
            'end_user_departments' => config('dropdown_data.END_USER_DEPARTMENT'),
        ]);
    }

    /**
     * Store a newly created asset and initialize its tracking steps.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'accountable_personnel' => 'required|string|max:255',
            'model' => 'nullable|string|max:255',
            'brand_make' => 'nullable|string|max:255',
            'serial_plate_id_number' => 'nullable|string|max:255',
            'end_user_department' => 'required|string|max:255',
            'asset_classification_id' => 'required|exists:asset_classifications,id',
            'asset_location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'reasons_for_disposal' => 'nullable|string',

            // Multi-upload validation hooks
            'assessment_reports' => 'required|array|min:1',
            'assessment_reports.*.file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'asset_photos' => 'required|array|min:1',
            'asset_photos.*.file' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
        ]);

        $reportPaths = [];
        if ($request->has('assessment_reports')) {
            foreach ($request->input('assessment_reports') as $index => $item) {
                if ($request->hasFile("assessment_reports.{$index}.file")) {
                    $file = $request->file("assessment_reports.{$index}.file");
                    $reportPaths[] = $file->store('reports', 'public');
                }
            }
        }

        $photoPaths = [];
        if ($request->has('asset_photos')) {
            foreach ($request->input('asset_photos') as $index => $item) {
                if ($request->hasFile("asset_photos.{$index}.file")) {
                    $file = $request->file("asset_photos.{$index}.file");
                    $photoPaths[] = $file->store('photos', 'public');
                }
            }
        }

        $assetData = [
            'accountable_personnel' => $validated['accountable_personnel'],
            'model' => $validated['model'],
            'brand_make' => $validated['brand_make'],
            'serial_plate_id_number' => $validated['serial_plate_id_number'],
            'end_user_department' => $validated['end_user_department'],
            'asset_classification_id' => $validated['asset_classification_id'],
            'asset_location' => $validated['asset_location'],
            'description' => $validated['description'],
            'reasons_for_disposal' => $validated['reasons_for_disposal'],

            // Storing the arrays of file path strings
            'assessment_reports' => $reportPaths,
            'asset_photos' => $photoPaths,

            // System defaults
            'user_id' => auth()->id(),
            'status' => 'Pending',
            'control_number' => null,
        ];

        DB::transaction(function () use ($assetData) {

            $asset = Asset::create($assetData);

            // Populate baseline workflow matrices
            for ($i = 1; $i <= 8; $i++) {
                $asset->approvals()->create([
                    'seq_no' => $i,
                    'is_current' => ($i === 1),
                    'status' => ($i === 1) ? 'On-going' : 'Pending',
                    'approver_id' => null,
                    'approval_date' => null,
                    'remarks' => null,
                ]);
            }

            // Initialize progress tracker logs
            AssetStatus::create([
                'asset_id' => $asset->id,
                'seq_no' => 1,
                'status' => 'Pending',
                'approver_id' => null,
                'approval_date' => null,
                'remarks' => 'Asset initialized in the inventory tracking system. Control Number Pending for Assignment.',
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
            //     $query->orderBy('seq_no', 'desc'); // if gusto paianaka una makita jud
            // },
            'user',
            'approvals.approver',
        ])->findOrFail($id);

        // dd($asset->toArray());

        return Inertia::render('asset-status', [
            'asset' => $asset,
        ]);
    }

    /**
     * Handle processing the authorization signing action for the active sequence stage.
     */
    public function assetApprove(Request $request, $id)
    {
        $request->validate([
            'remarks' => 'nullable|string|max:1000',
        ]);

        // Find the active approval tracking row belonging to this asset
        $currentApproval = AssetApproval::where('asset_id', $id)
            ->where('is_current', true)
            ->firstOrFail();

        $currentApproval->update([
            'is_current' => false,
            'status' => 'Approved',
            'approver_id' => auth()->id(), // Binds the authenticated user ID
            'approval_date' => now(),
            'remarks' => $request->remarks,
        ]);

        $nextApproval = AssetApproval::where('asset_id', $id)
            ->where('seq_no', $currentApproval->seq_no + 1)
            ->first();

        if ($nextApproval) {
            // Wake up the next department in line sequence workflow
            $nextApproval->update([
                'is_current' => true,
                'status' => 'On-going',
            ]);
        } else {
            // No more stages left in sequence; flag primary global asset profile complete
            Asset::where('id', $id)->update(['status' => 'Completed']);
        }

        // update individual asset status
        AssetStatus::where('asset_id', $id)->update([
            'seq_no' => $currentApproval->seq_no + 1,
            // 'is_current'    => true,
            'role' => 'asid',
            'status' => 'On-going',
            'approver_id' => Auth::id(),
            'approval_date' => now(),
            'remarks' => 'Asset initialized in the inventory tracking system. Control Number Pending Assignment.',
        ]);

        return redirect()->back()->with('success', 'Stage authorization processed successfully.');
    }

    public function asidEvaluate($id): Response
    {
        $asset = Asset::findOrFail($id);
        $asidInformation = AsidInformation::where('asset_id', $id)->first();

        $asset->asid_information = $asidInformation;

        return Inertia::render('asid/evaluate', [
            'asset' => $asset,
        ]);
    }

    public function asidEvaluateAction(Request $request, $id)
    {
        $validated = $request->validate([
            'remarks' => 'required|string|min:2|max:1000',
            'disposition' => 'required|string|min:2|max:1000',
            'reviewed_by' => 'required|string|min:2|max:1000',
            'checked_by' => 'required|string|min:2|max:1000',
        ]);

        $validated['status'] = 'Approved';

        $asset = Asset::findOrFail($id);

        try {

            DB::transaction(function () use ($asset, $validated) {

                $currentApproval = $asset->approvals()->where('is_current', true)->first();
                $currentSeq = $currentApproval ? $currentApproval->seq_no : 1;

                $asset->update(['status' => 'On-going']);

                $asset->approvals()->where('seq_no', $currentSeq)->update([
                    'is_current' => false,
                    'status' => $validated['status'],
                    'approver_id' => Auth::id(),
                    'approval_date' => now(),
                    'remarks' => $validated['remarks'],
                ]);

                $targetActiveSeq = $currentSeq;

                $nextApprovalExists = $asset->approvals()->where('seq_no', $currentSeq + 1)->exists();

                if ($nextApprovalExists) {
                    $targetActiveSeq = $currentSeq + 1;

                    $asset->approvals()->where('seq_no', $targetActiveSeq)->update([
                        'is_current' => true,
                        'status' => 'On-going',
                        'approver_id' => null,
                        'approval_date' => null,
                        'remarks' => null,
                    ]);
                } else {
                    $asset->update(['status' => 'Completed']);
                }

                AsidInformation::updateOrCreate(
                    ['asset_id' => $asset->id],
                    [
                        'role' => 'asid',
                        'remarks' => $validated['remarks'],
                        'disposition' => $validated['disposition'],
                        'checked_by' => $validated['checked_by'],
                        'reviewed_by' => $validated['reviewed_by'],
                        'status' => $validated['status'],
                        'approver_id' => Auth::id(),
                    ]
                );

                // Log details explicitly onto the row the user just interacted with
                AssetStatus::where('asset_id', $asset->id)
                    ->update([
                        'seq_no' => $targetActiveSeq,
                        'status' => $validated['status'],
                        'approver_id' => Auth::id(),
                        'approval_date' => now(),
                        'remarks' => $validated['remarks'],
                    ]);
            });

            return redirect()->route('asid-dashboard')->with('success', "Asset application state updated to: {$validated['status']}.");
        } catch (\Exception $e) {
            // Log the exact issue behind the scenes if something goes wrong
            Log::error("ASID Evaluation pipeline failure for Asset ID {$id}: ".$e->getMessage());

            return back()->withErrors([
                'error' => 'An internal database issue prevented completing the approval. Please re-submit.',
            ]);
        }
    }

    public function asidViewAsset($id)
    {
        $asset = Asset::with(['user', 'classification'])->findOrFail($id);

        return Inertia::render('asid/view', [
            'asset' => $asset,
        ]);
    }

    public function asidViewAssetAction(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Approved,Returned,Rejected,On-going,Pending',
            'remarks' => 'required|string|min:5|max:1000',
            'control_number' => 'required_if:status,Approved|nullable|string|max:255',
        ]);

        $asset = Asset::findOrFail($id);

        DB::transaction(function () use ($asset, $validated) {

            $currentApproval = $asset->approvals()->where('is_current', true)->first();
            $currentSeq = $currentApproval ? $currentApproval->seq_no : 1;

            $assetUpdate = ['status' => $validated['status']];

            if ($validated['status'] === 'Approved' && array_key_exists('control_number', $validated)) {
                $assetUpdate['control_number'] = $validated['control_number'];
                $assetUpdate['status'] = 'On-going';
            }

            $asset->update($assetUpdate);

            $asset->approvals()->where('seq_no', $currentSeq)->update([
                'is_current' => false,
                'status' => $validated['status'],
                'approver_id' => Auth::id(),
                'approval_date' => now(),
                'remarks' => $validated['remarks'],
            ]);

            $targetActiveSeq = $currentSeq;

            if ($validated['status'] === 'Approved' && $currentSeq < 8) {
                $targetActiveSeq = $currentSeq + 1;

                $asset->approvals()->where('seq_no', $targetActiveSeq)->update([
                    'is_current' => true,
                    'status' => 'On-going',
                    'approver_id' => null,
                    'approval_date' => null,
                    'remarks' => null,
                ]);
            } elseif ($validated['status'] === 'Returned') {
                $targetActiveSeq = 1; // Send back to step 1

                $asset->approvals()->where('seq_no', $targetActiveSeq)->update([
                    'is_current' => true,
                    'status' => 'On-going',
                    'approver_id' => null,
                    'approval_date' => null,
                    'remarks' => null,
                ]);
            } elseif ($validated['status'] === 'Rejected') {
                $targetActiveSeq = $currentSeq;
            }

            // Log details explicitly onto the row the user just interacted with
            AssetStatus::where('asset_id', $asset->id)
                ->update([
                    'seq_no' => $targetActiveSeq,
                    'status' => $validated['status'],
                    'approver_id' => Auth::id(),
                    'approval_date' => now(),
                    'remarks' => $validated['remarks'],
                ]);
        });

        return redirect()->route('asid-dashboard')->with('success', "Asset application state updated to: {$validated['status']}.");
    }

    public function accountingEvaluate($id)
    {

        $asset = Asset::with(['user', 'classification', 'accounting_information', 'workflow'])->findOrFail($id);

        return Inertia::render('accounting/evaluate', [
            'asset' => $asset,
        ]);
    }

    // Accounting flow -- Step 1 dria muagi una..
    public function accountingEvaluateSaveOnly(Request $request, $id)
    {

        $asset = Asset::findOrFail($id);

        $validatedData = $request->validate([
            'asset_number' => 'required|string|max:100|unique:accounting_information,asset_number,'.$asset->id.',asset_id',
            'acquisition_date' => 'required|date',
            'acquisition_cost' => 'required|numeric|min:0',
            'book_value' => 'required|numeric|min:0',
            'remarks' => 'nullable|string|max:1000',
            'checked_by' => 'required|string|max:255',
        ]);
        // dd($request); // gi-atay kalibog sa utok!
        DB::transaction(function () use ($asset, $validatedData, $id) {
            AccountingInformation::updateOrCreate(
                ['asset_id' => $asset->id],
                [
                    'role' => 'accounting',
                    'asset_number' => $validatedData['asset_number'],
                    'acquisition_date' => $validatedData['acquisition_date'],
                    'acquisition_cost' => $validatedData['acquisition_cost'],
                    'book_value' => $validatedData['book_value'],
                    'remarks' => $validatedData['remarks'],
                    'checked_by' => $validatedData['checked_by'],
                    'conformed_by' => 'N/A',
                    'status' => 'On-going',
                    'approver_id' => Auth::id(),
                ]
            );

            Workflow::updateOrCreate(
                ['asset_id' => $id],
                [
                    'workflow_step' => 1,
                    'status' => 'On-going',
                ]
            );
        });

        // return redirect()->route('accounting-dashboard')
        //         ->with('success', 'Document Saved, ');
        return back()->with('success', 'Accounting records saved successfully.');

    }

    // Accounting flow -- Step 2 mauna ni next kay para ma process kunohay sa workflow..
    public function accountingEvaluateWorkflowAction(Request $request, $id)
    {
        // dd($request);
        // no $request use for now.. kay temporary lang ni..
        $asset = Asset::findOrFail($id);

        DB::transaction(function () use ($asset, $id) {
            $asset->accounting_information()->updateOrCreate(
                [],
                ['conformed_by' => 'Ivan Moreno']
            );

            Workflow::updateOrCreate(
                ['asset_id' => $id],
                [
                    'workflow_step' => 1,
                    'status' => 'Approved',
                ]
            );
        });

        // return back()->with('success', 'Accounting records saved successfully.');
        return redirect()->route('accounting-dashboard')
            ->with('success', 'Asset disposal request successfully submitted to Workflow System. Please wait for the respective response.');

        // return back()->with('success', 'Asset disposal request successfully submitted to Workflow System. Please wait for the respective response.');
    }

    // Accounting flow -- Step 3 mauna ni last part para ma sequence.. HAHAYZZZZZZZ!
    public function accountingEvaluateAction(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);

        $validatedData = $request->validate([
            'asset_number' => ['required', 'string', 'max:100', Rule::unique('accounting_information', 'asset_number')->ignore($asset->id, 'asset_id')],
            'acquisition_date' => 'required|date',
            'acquisition_cost' => 'required|numeric|min:0',
            'book_value' => 'required|numeric|min:0',
            'remarks' => 'nullable|string|max:1000',
            'checked_by' => 'required|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            AccountingInformation::updateOrCreate(
                ['asset_id' => $asset->id],
                [
                    'role' => 'accounting',
                    'asset_number' => $validatedData['asset_number'],
                    'acquisition_date' => $validatedData['acquisition_date'],
                    'acquisition_cost' => $validatedData['acquisition_cost'],
                    'book_value' => $validatedData['book_value'],
                    'remarks' => $validatedData['remarks'],
                    'checked_by' => $validatedData['checked_by'],
                    'conformed_by' => 'N/A',
                    'status' => 'Approved',
                    'approver_id' => Auth::id(),
                ]
            );

            $currentApproval = AssetApproval::where('asset_id', $id)
                ->where('is_current', true)
                ->firstOrFail();

            $currentApproval->update([
                'is_current' => false,
                'status' => 'Approved',
                'approver_id' => Auth::id(),
                'approval_date' => now(),
                'remarks' => $validatedData['remarks'],
            ]);

            $nextApproval = AssetApproval::where('asset_id', $id)
                ->where('seq_no', $currentApproval->seq_no + 1)
                ->first();

            if ($nextApproval) {
                $nextApproval->update([
                    'is_current' => true,
                    'status' => 'On-going',
                ]);

                $asset->update([
                    'status' => 'On-going',
                    // 'status' => 'pending_workflow_approval' // mao ni if goods na ang WORKFLOW vice versa connection! eyy!! then add og algo for WORKFLOW app. try lang muna :)
                ]);

                $message = 'Accounting details recorded. Asset evaluation successfully advanced to the next sequence.';
            } else {
                $asset->update([
                    'status' => 'Completed',
                ]);

                $message = 'Accounting details recorded. All tracking sequence steps complete; asset pipeline marked as Completed.';
            }

            AssetStatus::where('asset_id', $asset->id)
                ->update([
                    'seq_no' => $currentApproval->seq_no + 1,
                    'status' => 'On-going',
                    'approver_id' => Auth::id(),
                    'approval_date' => now(),
                    'remarks' => $validatedData['remarks'],
                ]);

            DB::commit();

            // return back()->with($message);
            return redirect()->route('accounting-dashboard')
                ->with('success', $message);

        } catch (\Exception $e) {
            // Discard all table queries cleanly if anything goes wrong
            DB::rollBack();

            Log::error("Failed transaction sequence processing accounting evaluation for Asset ID {$id}: ".$e->getMessage());

            return back()->withErrors([
                'error' => 'An operational database issue halted processing your asset updates. Please try again.',
            ]);
        }
    }

    public function mcdEvaluate($id)
    {
        $asset = Asset::with(['user', 'classification', 'accounting_information', 'mcd_information'])->findOrFail($id);

        return Inertia::render('mcd/evaluate', [
            'asset' => $asset,
        ]);

    }

    public function mcdEvaluateAction(Request $request, $id)
    {

        $asset = Asset::findOrFail($id);

        $validatedData = $request->validate([
            'par_number' => 'nullable|string|max:1000',
            'par_remarks' => 'nullable|string|max:1000',
        ]);

        DB::beginTransaction();

        try {

            McdInformation::updateOrCreate(
                ['asset_id' => $asset->id],
                [
                    'role' => 'mcd',
                    'par_number' => $validatedData['par_number'],
                    'remarks' => $validatedData['par_remarks'],
                    'approver_id' => Auth::id(),
                    'status' => 'Approved',
                ]
            );

            $currentApproval = AssetApproval::where('asset_id', $id)
                ->where('is_current', true)
                ->firstOrFail();

            $currentApproval->update([
                'is_current' => false,
                'status' => 'Approved',
                'approver_id' => Auth::id(),
                'approval_date' => now(),
                'remarks' => $validatedData['par_remarks'],
            ]);

            AssetStatus::where('asset_id', $asset->id)
                ->update([
                    'seq_no' => $currentApproval->seq_no,
                    'status' => 'Approved',
                    'approver_id' => Auth::id(),
                    'approval_date' => now(),
                    'remarks' => $validatedData['par_remarks'],
                ]);

            $nextApproval = AssetApproval::where('asset_id', $id)
                ->where('seq_no', $currentApproval->seq_no + 1)
                ->first();

            if ($nextApproval) {
                $nextApproval->update([
                    'is_current' => true,
                    'status' => 'On-going',
                ]);

                $asset->update([
                    'status' => 'On-going',
                ]);

                $message = 'MCD Phase tracking details logged. Asset evaluation advanced to the next milestone sequence.';
            } else {
                $asset->update([
                    'status' => 'Completed',
                ]);

                $message = 'MCD Phase tracking details logged. All tracking sequence steps complete; asset pipeline marked as Completed.';
            }

            DB::commit();

            return redirect()->route('mcd-dashboard')
                ->with('success', $message);

        } catch (\Exception $e) {
            // Rollback all pending queries clean if something crashes mid-execution
            DB::rollBack();

            Log::error("Failed transaction sequence processing MCD evaluation for Asset ID {$id}: ".$e->getMessage());

            return back()->withErrors([
                'error' => 'An operational database issue halted processing your MCD updates. Please try again.',
            ]);
        }

    }

    public function mepeoEvaluate($id)
    {
        $asset = Asset::with(['user',
            'classification',
            'accounting_information',
            'mcd_information',
            'mepeo_information',
            'mepeo_information.wasteClassification',
            'mepeo_information.wasteCharacteristic'])
            ->findOrFail($id);

        $wasteClassifications = WasteClassification::all(['id', 'name']);
        $wasteCharacteristics = WasteCharacteristic::all(['id', 'name']);

        return Inertia::render('mepeo/evaluate', [
            'asset' => $asset,
            'wasteClassifications' => $wasteClassifications,
            'wasteCharacteristics' => $wasteCharacteristics,
        ]);
    }

    public function mepeoEvaluateAction(Request $request, $id)
    {

        // dd($request->toArray());

        // dria nako..
        $asset = Asset::findOrFail($id);

        $validatedData = $request->validate([
            'waste_classification_id' => 'required|numeric|min:0',
            'waste_characteristic_id' => 'required|numeric|min:0',
            'mepeo_remarks' => 'required|string|min:2|max:1000',
        ]);

        DB::beginTransaction();

        try {

            MepeoInformation::updateOrCreate(
                ['asset_id' => $asset->id],
                [
                    'approver_id' => Auth::id(),
                    'waste_classification_id' => $validatedData['waste_classification_id'],
                    'waste_characteristic_id' => $validatedData['waste_characteristic_id'],
                    'remarks' => $validatedData['mepeo_remarks'],
                    'status' => 'Approved',
                ]
            );

            $currentApproval = AssetApproval::where('asset_id', $id)
                ->where('is_current', true)
                ->firstOrFail();

            $currentApproval->update([
                'is_current' => false,
                'status' => 'Approved',
                'approver_id' => Auth::id(),
                'approval_date' => now(),
                'remarks' => $validatedData['mepeo_remarks'],
            ]);

            AssetStatus::where('asset_id', $asset->id)
                ->update([
                    'seq_no' => $currentApproval->seq_no,
                    'status' => 'Approved',
                    'approver_id' => Auth::id(),
                    'approval_date' => now(),
                    'remarks' => $validatedData['mepeo_remarks'],
                ]);

            $nextApproval = AssetApproval::where('asset_id', $id)
                ->where('seq_no', $currentApproval->seq_no + 1)
                ->first();

            if ($nextApproval) {
                $nextApproval->update([
                    'is_current' => true,
                    'status' => 'On-going',
                ]);

                $asset->update([
                    'status' => 'On-going',
                ]);

                $message = 'MEPEO Phase tracking details logged. Asset evaluation advanced to the next milestone sequence.';
            } else {
                $asset->update([
                    'status' => 'Completed',
                ]);

                $message = 'MEPEO Phase tracking details logged. All tracking sequence steps complete; asset pipeline marked as Completed.';
            }

            DB::commit();

            return redirect()->route('mepeo-dashboard')
                ->with('success', $message);

        } catch (\Exception $e) {
            // Rollback all pending queries clean if something crashes mid-execution
            DB::rollBack();

            Log::error("Failed transaction sequence processing MEPEO evaluation for Asset ID {$id}: ".$e->getMessage());

            return back()->withErrors([
                'error' => 'An operational database issue halted processing your MEPEO updates. Please try again.',
            ]);
        }

    }

    // Bidding functions BELOW..

    public function userBidding()
    {
        $assetOnBidding = AssetBidding::with([
            'asset.accounting_information',
            'asset.bids' => function ($query) {
                $query->where('user_id', Auth::id());
            },
        ])->get();

        return Inertia::render('bidding', [
            'assetOnBidding' => $assetOnBidding,
        ]);
    }

    public function userBiddingEntry(Request $request, $id)
    {
        $asset = Asset::where('status', 'Approved')->findOrFail($id);

        $validated = $request->validate([
            'bidder_name' => 'nullable|string|max:255',
            'bidder_contact_number' => 'nullable|string|max:50',
            'bidder_classification' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'date_hired' => 'nullable|date',
            'bidding_cycle' => 'nullable|integer|min:1',
            'bidding_price' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
            'reference_number' => 'nullable|string|max:255',
        ]);

        Bidding::create([
            'asset_id' => $asset->id,
            'user_id' => Auth::id(),
            'bidder_name' => $validated['bidder_name'] ?? null,
            'bidder_contact_number' => $validated['bidder_contact_number'] ?? null,
            'bidder_classification' => $validated['bidder_classification'] ?? null,
            'department' => $validated['department'] ?? null,
            'date_hired' => $validated['date_hired'] ?? null,
            'bidding_cycle' => $validated['bidding_cycle'] ?? 1,
            'bidding_price' => $validated['bidding_price'],
            'bid_status' => 'pending',
            'remarks' => $validated['remarks'] ?? null,
            'reference_number' => $validated['reference_number'] ?? null,
            'submitted_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Bidding entry submitted successfully!');
    }

    public function forms()
    {
        // Fetch forms and map over them to format the keys for React
        $files = Form::with('user')->get()->map(function ($form) {
            return [
                'id' => $form->id,
                'file_name' => $form->original_name ?? basename($form->document_path), // Fallback if null
                'purpose' => $form->purpose,
                'file_path' => Storage::url($form->document_path),
                'user' => $form->user ? [
                    'name' => $form->user->name,
                    'email' => $form->user->email,
                ] : null,
            ];
        });

        // Return to the 'Forms' React page component matching its expected prop names
        return Inertia::render('forms', [
            'uploadedFiles' => $files,
        ]);
    }

    public function formUpload(Request $request)
    {

        // Validate the file and the purpose description
        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,png|max:10240',
            'purpose' => 'required|string|max:1000',
        ]);
        //  dd($request);
        if ($request->hasFile('file')) {
            // Upload the file to your local public storage disk
            $uploadedFile = $request->file('file');

            $originalName = $uploadedFile->getClientOriginalName();

            $filePath = $uploadedFile->store('uploads/forms', 'public');

            // Create the record using your columns
            Form::create([
                'user_id' => Auth::id(),
                'document_path' => $filePath,
                'original_name' => $originalName,
                'purpose' => $validated['purpose'],
            ]);

            return redirect()->back()->with('success', 'Document uploaded successfully!');
        }

        return redirect()->back()->with('error', 'Failed to upload document.');
    }

    public function formUpdate(Request $request, $id)
    {
        $form = Form::findOrFail($id);

        $validated = $request->validate([
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240',
            'purpose' => 'required|string|max:1000',
        ]);

        $updateData = [
            'purpose' => $validated['purpose'],
        ];

        if ($request->hasFile('file')) {

            if ($form->document_path && Storage::disk('public')->exists($form->document_path)) {
                Storage::disk('public')->delete($form->document_path);
            }

            $uploadedFile = $request->file('file');
            $filePath = $uploadedFile->store('uploads/forms', 'public');

            $updateData['document_path'] = $filePath;
            $updateData['original_name'] = $uploadedFile->getClientOriginalName();
        }

        $form->update($updateData);

        return redirect()->back()->with('success', 'Document updated successfully!');
    }

    public function formDelete($id)
    {
        $form = Form::findOrFail($id);

        if ($form->document_path && Storage::disk('public')->exists($form->document_path)) {
            Storage::disk('public')->delete($form->document_path);
        }

        $form->delete();

        return redirect()->back()->with('success', 'Document and its physical file were completely removed!');
    }
}
