use crate::*;
use newtypes::FpId;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::Vendor;

#[derive(Debug, Clone, Apiv2Schema, Deserialize)]
pub struct ApexCipReportRequest {
    /// The default approver name/email to use for automatically approved users. This will be
    /// overwritten if done by a manual reviewer
    pub default_approver: PiiString,
}

#[derive(Debug, Clone, Apiv2Schema, Deserialize)]
pub struct OldApexCipReportRequest {
    /// the footprint user id on behalf of which to send the request
    pub fp_user_id: FpId,

    /// The default approver name/email to use for automatically approved users. This will be
    /// overwritten if done by a manual reviewer
    pub default_approver: PiiString,
}

#[derive(Debug, Clone, Apiv2Schema, Serialize)]
pub struct ApexCheckedKycData {
    pub customer_name: PiiString,
    pub tax_id: Option<PiiString>,
    pub address: PiiString,
    pub date_of_birth: PiiString,
}

#[derive(Debug, Clone, Apiv2Schema, Serialize)]
pub struct ApexSelfReportedData {
    pub occupation: Option<PiiString>,
    pub employment_status: Option<PiiString>,
    pub is_employed_at_brokerage_firm: Option<PiiString>,
    pub declarations: Option<PiiString>,
    pub annual_income: Option<PiiString>,
    pub net_worth: Option<PiiString>,
    pub investment_objectives: Option<PiiString>,
    pub us_legal_status: Option<PiiString>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub visa_kind: Option<PiiString>,
    pub citizenships: Option<PiiString>,
}

#[derive(Debug, Clone, Apiv2Schema, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ApexCipResult {
    Clear,
    Consider,
}

impl From<alpaca::CipResult> for ApexCipResult {
    fn from(value: alpaca::CipResult) -> Self {
        match value {
            alpaca::CipResult::Clear => Self::Clear,
            alpaca::CipResult::Consider => Self::Consider,
        }
    }
}
#[derive(Debug, Clone, Apiv2Response, Serialize, macros::JsonResponder)]
pub struct ApexCipSummaryResults {
    pub user_id: FpId,
    pub checked_data: ApexCheckedKycData,
    pub self_reported: ApexSelfReportedData,
    pub kyc_completed_at: Option<chrono::DateTime<Utc>>,
    pub ip_address: PiiString,
    pub check_initiated_at: Option<chrono::DateTime<Utc>>,
    pub check_completed_at: Option<chrono::DateTime<Utc>>,
    pub approved_reason: Option<String>,
    pub approved_by: PiiString,
    pub approved_at: chrono::DateTime<Utc>,

    pub result: ApexCipResult,
    pub matched_address: ApexCipResult,
    pub matched_addresses: Vec<Vendor>,
    pub date_of_birth: ApexCipResult,
    pub date_of_birth_breakdown: Vec<Vendor>,
    pub tax_id: ApexCipResult,
    pub tax_id_breakdown: Vec<Vendor>,

    pub watchlist: ApexWatchlist,
}

#[derive(Debug, Clone, Apiv2Schema, Serialize)]
pub struct ApexWatchlist {
    pub result: ApexCipResult,
    pub check_completed_at: chrono::DateTime<Utc>,
    pub politically_exposed_person: ApexCipResult,
    pub sanction: ApexCipResult,
    pub adverse_media: ApexCipResult,
    pub monitored_lists: ApexCipResult,
    pub records: Vec<PiiJsonValue>,
}
