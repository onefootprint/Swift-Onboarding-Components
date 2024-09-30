use idv::sentilink::application_risk::response::ValidatedApplicationRiskResponse;
use newtypes::FootprintReasonCode as FRC;


// TODO: put thresholds on TVC or RuleSetVersion. We don't want to require a deploy here
const SYNTHETIC_SCORE_HIGH: i32 = 600;
const SYNTHETIC_SCORE_MEDIUM: i32 = 400;

pub fn footprint_reason_codes(response: &ValidatedApplicationRiskResponse) -> Vec<FRC> {
    // TODO: sentilink score reason codes
    // TODO: id theft
    let synthetic_reason_code = if response.synthetic_score.score > SYNTHETIC_SCORE_HIGH {
        FRC::SyntheticIdentityHighRisk
    } else if response.synthetic_score.score > SYNTHETIC_SCORE_MEDIUM {
        FRC::SyntheticIdentityMediumRisk
    } else {
        FRC::SyntheticIdentityLowRisk
    };

    vec![synthetic_reason_code]
}
