use idv::sentilink::application_risk::response::ValidatedApplicationRiskResponse;
use newtypes::FootprintReasonCode as FRC;


// TODO: put thresholds on TVC or RuleSet. We don't want to require a deploy here
// Recommendations from Sentilink. Test and adjust for individual Tenants
// 750-800 high risk
// 400-700 medium
// 400 low risk
pub const SCORE_THRESHOLD_HIGH: i32 = 750;
pub const SCORE_THRESHOLD_MEDIUM: i32 = 400;

pub fn footprint_reason_codes(response: &ValidatedApplicationRiskResponse) -> Vec<FRC> {
    let synthetic_reason_code = if response.synthetic_score.score >= SCORE_THRESHOLD_HIGH {
        FRC::SentilinkSyntheticIdentityHighRisk
    } else if response.synthetic_score.score > SCORE_THRESHOLD_MEDIUM {
        FRC::SentilinkSyntheticIdentityMediumRisk
    } else {
        FRC::SentilinkSyntheticIdentityLowRisk
    };

    let id_theft = if response.id_theft_score.score >= SCORE_THRESHOLD_HIGH {
        FRC::SentilinkIdentityTheftHighRisk
    } else if response.id_theft_score.score > SCORE_THRESHOLD_MEDIUM {
        FRC::SentilinkIdentityTheftMediumRisk
    } else {
        FRC::SentilinkIdentityTheftLowRisk
    };

    vec![synthetic_reason_code, id_theft]
}
