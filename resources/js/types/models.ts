export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    status: string;
    role?: Role | null;
    role_id: number | string;
}

export interface Role {
    id: number;
    name: string;
}

export interface Asset {
    id: number;
    control_number: string | null;
    accountable_personnel: string;
    model: string | null;
    brand_make: string | null;
    serial_plate_id_number: string | null;
    end_user_department: string;
    reasons_for_disposal: string;
    asset_location: string;
    description: string | null;
    asset_classification_id: AssetClassification | null;
    status: string;
    user?: User;
    mepeo_information?: MepeoInfo | null;
    manager_information?: ManagerInfo | null;
    asid_information?: AsidInfo | null;
    mcd_information?: McdInfo | null;
    asset_disposal?: AssetDisposal | null;
    asset_scraps?: AssetScraps | null;
    asset_bidding?: AssetBidding | null;
    bidding_listing?: AssetBidding | null;
    accounting_information?: AccountingInfo | null;
    bids?: Bidding[];
    asset_photos?: (string | AssetPhoto)[] | null;
}

export interface Approver {
    id: number;
    name: string;
}

export interface AssetStatusData {
    id: number;
    seq_no: number;
    is_current: boolean;
    status: string;
    remarks: string | null;
    created_at: string;
    asset_id: number;
    asset: Asset | null;
    approver: Approver | null;
}

export interface AssetClassification {
    id: number;
    name: string;
    code: string;
    description: string;
}

export interface MepeoInfo {
    id: number;
    waste_classification_id: number;
    waste_characteristic_id: number;
    waste_classification: WasteClassification | null;
    waste_characteristic: WasteCharacteristic | null;
    remarks: string;
}

export interface WasteClassification {
    id: number;
    name: string
}

export interface WasteCharacteristic {
    id: number;
    name: string
}

export interface McdInfo {
    id: number;
    asset_id: number;
    role: string;
    par_number: string;
    remarks: string;
    photo: string | null;
    approver_id: number;
    status: string;
    manager_remarks: string;
    manager_check: string;
}

export interface ManagerInfo {
    id: number;
    asset_direction: string;
    manager_reviewed_by: string;
    reviewed_by: string;
    manager_disposition: string;
    bidding_price: number;
    bidding_cycle?: number | string | null;
}

export interface AsidInfo {
    id: number;
    remarks: string;
    checked_by: string;
    disposition: string;
    reviewed_by: string;
}

export interface AccountingInfo {
    id: number;
    asset_id: number;
    asset_number: number;
    acquisition_cost: number;
    book_value: number;
    remarks: string;
    checked_by: string;
}

export interface AssetDisposal {
    id: number;
    asset_id: number;
    user_id: number;
    others: string;
}

export interface AssetScraps {
    id: number;
    asset_id: number;
    status: string;
}

export interface AssetBidding {
    id: number;
    asset_id: number;
    status: string;
    category?: string | null;
}

export interface AssetPhoto {
    file_path?: string;
    path?: string;
    url?: string;
    description?: string | null;
}

export interface Bidding {
    id: number;
    asset_id: number;
    user_id: number;
    bidder_name: string | null;
    bidder_contact_number: string | null;
    bidder_classification: string | null;
    department: string | null;
    date_hired: string | null;
    bidding_cycle: number | string | null;
    bidding_price: number | string;
    bid_status: string | null;
    remarks: string | null;
    reference_number: string | null;
    submitted_at: string | null;
}