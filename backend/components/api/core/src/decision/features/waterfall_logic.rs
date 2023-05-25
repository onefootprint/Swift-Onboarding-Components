use newtypes::VendorAPI;

use crate::decision::{rule::rules_engine::OnboardingEvaluationResult, RuleError};

/// Helper struct to work with our waterfall logic
#[derive(PartialEq, Eq, Debug)]
pub struct OnboardingEvaluationResultWithVendorAPI {
    pub vendor_api: VendorAPI,
    pub result: OnboardingEvaluationResult,
}
impl OnboardingEvaluationResultWithVendorAPI {
    pub fn new(vendor_api: VendorAPI, result: OnboardingEvaluationResult) -> Self {
        Self { vendor_api, result }
    }
}
impl std::ops::Deref for OnboardingEvaluationResultWithVendorAPI {
    type Target = OnboardingEvaluationResult;
    fn deref(&self) -> &Self::Target {
        &self.result
    }
}

pub struct WaterFallLogic;
impl WaterFallLogic {
    pub fn get_kyc_rules_result(
        input_results: Vec<OnboardingEvaluationResultWithVendorAPI>,
    ) -> Result<OnboardingEvaluationResultWithVendorAPI, RuleError> {
        // Logic:
        //   Choose the least egregious action if 2 vendors disagree.
        //     - This will possibly change in the future for fraud-adverse tenants, but I think in that case we will have
        //       a better sense of what we want to do, so for now, anchor to conversion
        //
        // Note: triggered_action == None (e.g. Pass) will by default be the min
        let waterfall_result = input_results
            .into_iter()
            .min_by(|x, y| x.triggered_action.cmp(&y.triggered_action))
            .ok_or(RuleError::AssertionError("could not compute waterfall".into()))?;

        Ok(waterfall_result)
    }
}

#[cfg(test)]
mod tests {
    use crate::decision::rule::rule_set::Action;

    use super::*;
    use test_case::test_case;
    fn make_oebr(action: Option<Action>) -> Option<OnboardingEvaluationResult> {
        Some(OnboardingEvaluationResult {
            rules_triggered: vec![],
            rules_not_triggered: vec![],
            triggered_action: action,
        })
    }

    #[test_case(make_oebr(Some(Action::Fail)), None => Ok(OnboardingEvaluationResultWithVendorAPI::new(VendorAPI::IdologyExpectID, make_oebr(Some(Action::Fail)).unwrap())); "idology fails, no experian => fails")]
    #[test_case(make_oebr(Some(Action::Fail)), make_oebr(Some(Action::Fail)) => Ok(OnboardingEvaluationResultWithVendorAPI::new(VendorAPI::ExperianPreciseID, make_oebr(Some(Action::Fail)).unwrap())); "both fail => fails")]
    #[test_case(make_oebr(Some(Action::Fail)), make_oebr(Some(Action::StepUp)) => Ok(OnboardingEvaluationResultWithVendorAPI::new(VendorAPI::ExperianPreciseID, make_oebr(Some(Action::StepUp)).unwrap())); "idology fails, experian steps up => steps up")]
    #[test_case(make_oebr(Some(Action::StepUp)), make_oebr(Some(Action::StepUp)) => Ok(OnboardingEvaluationResultWithVendorAPI::new(VendorAPI::ExperianPreciseID, make_oebr(Some(Action::StepUp)).unwrap())); "both step up => stepup")]
    #[test_case(make_oebr(None), make_oebr(Some(Action::StepUp)) => Ok(OnboardingEvaluationResultWithVendorAPI::new(VendorAPI::IdologyExpectID, make_oebr(None).unwrap())); "idology passes, experain steps up => pass")]
    #[test_case(make_oebr(None), make_oebr(Some(Action::Fail)) => Ok(OnboardingEvaluationResultWithVendorAPI::new(VendorAPI::IdologyExpectID, make_oebr(None).unwrap())); "idology passes, experian fails => pass")]
    #[test_case(make_oebr(Some(Action::StepUp)), make_oebr(None) => Ok(OnboardingEvaluationResultWithVendorAPI::new(VendorAPI::ExperianPreciseID, make_oebr(None).unwrap())); "experian passes, idology steps up => pass")]
    #[test_case(make_oebr(Some(Action::Fail)), make_oebr(None) => Ok(OnboardingEvaluationResultWithVendorAPI::new(VendorAPI::ExperianPreciseID, make_oebr(None).unwrap())); "experian  passes, idology fails => pass")]

    fn test_get_kyc_rules_result(
        idology_result: Option<OnboardingEvaluationResult>,
        experian_result: Option<OnboardingEvaluationResult>,
    ) -> Result<OnboardingEvaluationResultWithVendorAPI, RuleError> {
        let e = experian_result
            .map(|er| OnboardingEvaluationResultWithVendorAPI::new(VendorAPI::ExperianPreciseID, er));
        let i = idology_result
            .map(|ir| OnboardingEvaluationResultWithVendorAPI::new(VendorAPI::IdologyExpectID, ir));
        let results = vec![e, i].into_iter().flatten().collect();
        WaterFallLogic::get_kyc_rules_result(results)
    }
}
