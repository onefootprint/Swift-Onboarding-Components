use crate::utils::db2api::DbToApi;
use idv::sentilink::application_risk::response::ReasonCode as IdvSentilinkReasonCode;
use idv::sentilink::application_risk::response::Score;
use itertools::Itertools;
use newtypes::SentilinkHumanReadableScoreReasonCode;


impl DbToApi<Score> for api_wire_types::SentilinkScoreDetail {
    fn from_db(s: Score) -> Self {
        Self {
            score: s.score,
            reason_codes: s
                .reason_codes
                .into_iter()
                .sorted_by_key(|r| r.rank)
                .map(api_wire_types::SentilinkReasonCode::from_db)
                .collect(),
        }
    }
}

impl DbToApi<IdvSentilinkReasonCode> for api_wire_types::SentilinkReasonCode {
    fn from_db(rc: IdvSentilinkReasonCode) -> Self {
        let IdvSentilinkReasonCode {
            code,
            rank,
            direction,
            explanation,
        } = rc;

        let human_readable: SentilinkHumanReadableScoreReasonCode = code.into();
        Self {
            code: human_readable.to_string(),
            rank,
            direction,
            explanation,
        }
    }
}
