use idv::idology::expectid::response::ExpectIDResponse;
use newtypes::{DecisionStatus, FootprintReasonCode, VerificationResultId};

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IDologyFeatures {
    pub status: DecisionStatus,
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub id_located: bool,
    pub id_number_for_scan_required: Option<u64>,
    pub is_id_scan_required: bool,
    pub verification_result: VerificationResultId,
    pub create_manual_review: bool,
}

impl IDologyFeatures {
    pub fn from(resp: ExpectIDResponse, verification_result_id: VerificationResultId) -> Self {
        let r = resp.response;

        // TODO: fix this to just be id_located. Shouldn't have idv crate doing anything w.r.t. our DecisionStatus
        let (status, create_manual_review) = r.status();
        let mut footprint_reason_codes: Vec<FootprintReasonCode> = r.footprint_reason_codes();

        if r.max_watchlist_score().map(|s| s > 93).unwrap_or(false)
            && !footprint_reason_codes.contains(&FootprintReasonCode::WatchlistHit)
        {
            footprint_reason_codes.push(FootprintReasonCode::WatchlistHit)
        } else if r.has_potential_watchlist_hit()
            && !footprint_reason_codes.contains(&FootprintReasonCode::PotentialWatchlistHit)
        {
            footprint_reason_codes.push(FootprintReasonCode::PotentialWatchlistHit)
        }

        // Add reason code for not locating
        let id_located = r.id_located();
        if !id_located {
            footprint_reason_codes.push(FootprintReasonCode::IdNotLocated)
        }

        Self {
            status,
            create_manual_review,
            id_located,
            is_id_scan_required: r.is_id_scan_required(),
            id_number_for_scan_required: r.id_number,
            verification_result: verification_result_id,
            footprint_reason_codes,
        }
    }
}
