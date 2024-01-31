use super::OnboardingRulesDecision;
use crate::{
    decision::{
        features::{
            kyb_features::KybFeatureVector,
            risk_signals::{risk_signal_group_struct::Kyb, RiskSignalGroupStruct},
        },
        onboarding::FeatureVector,
    },
    errors::ApiResult,
};
use db::models::onboarding_decision::OnboardingDecision;

pub fn evaluate_kyb_rules(
    rsg: RiskSignalGroupStruct<Kyb>,
    bo_obds: Vec<OnboardingDecision>,
) -> ApiResult<OnboardingRulesDecision> {
    let reason_codes = rsg
        .footprint_reason_codes
        .into_iter()
        .map(|(rc, _, _)| rc)
        .collect();
    let fv = KybFeatureVector::new(reason_codes, bo_obds);
    fv.evaluate()
}
