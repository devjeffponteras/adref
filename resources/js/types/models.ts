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
    description: string | null;
    asset_classification_id: AssetClassification | null;
    status: string;
    user?: User;
    mepeo_info: MepeoInfo | null;
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
}