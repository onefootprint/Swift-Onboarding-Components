use idv::idology::expectid::response::ExpectIDResponse;
use newtypes::{FootprintReasonCode, VerificationResultId};

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IDologyFeatures {
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub id_number_for_scan_required: Option<u64>,
    pub is_id_scan_required: bool,
    pub verification_result: VerificationResultId,
}

impl IDologyFeatures {
    pub fn from(resp: ExpectIDResponse, verification_result_id: VerificationResultId) -> Self {
        let r = resp.response;

        let mut footprint_reason_codes: Vec<FootprintReasonCode> = r.footprint_reason_codes();

        // Add reason code for not locating
        let id_located = r.id_located();
        if !id_located {
            footprint_reason_codes.push(FootprintReasonCode::IdNotLocated)
        }

        Self {
            is_id_scan_required: r.is_id_scan_required(),
            id_number_for_scan_required: r.id_number,
            verification_result: verification_result_id,
            footprint_reason_codes,
        }
    }
}
