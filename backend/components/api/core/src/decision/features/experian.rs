use idv::experian::{cross_core::response::CrossCoreAPIResponse, precise_id::response::PreciseIDParsedScore};
use newtypes::{FootprintReasonCode, VerificationResultId};

const SCORE_THRESHOLD: i32 = 580;

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExperianFeatures {
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub verification_result_id: VerificationResultId,
}

impl ExperianFeatures {
    pub fn from(resp: CrossCoreAPIResponse, verification_result_id: VerificationResultId) -> Self {
        let score_reason_code = resp
            .precise_id_response()
            .ok()
            .and_then(|p| p.score().ok().and_then(score_to_reason_code));

        let reason_codes = if let Some(src) = score_reason_code {
            vec![src]
        } else {
            vec![]
        };

        Self {
            footprint_reason_codes: reason_codes,
            verification_result_id,
        }
    }
}

fn score_to_reason_code(score: PreciseIDParsedScore) -> Option<FootprintReasonCode> {
    match score {
        PreciseIDParsedScore::ConsumerNotFound => Some(FootprintReasonCode::IdNotLocated),
        PreciseIDParsedScore::Deceased => Some(FootprintReasonCode::SubjectDeceased),
        PreciseIDParsedScore::BlockedFile => Some(FootprintReasonCode::IdNotLocated),
        PreciseIDParsedScore::Score(s) => {
            if s >= SCORE_THRESHOLD {
                None
            } else {
                Some(FootprintReasonCode::IdNotLocated)
            }
        }
        // TODO: probably should error upstream for this
        PreciseIDParsedScore::InvalidScore => None,
        PreciseIDParsedScore::MissingOrInvalidInputData => None,
    }
}
