use crate::decision::{rule::rules_engine::OnboardingEvaluationResult, RuleError};

pub fn get_kyc_rules_result(
    input_results: Vec<OnboardingEvaluationResult>,
) -> Result<OnboardingEvaluationResult, RuleError> {
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

#[cfg(test)]
mod tests {
    use crate::decision::rule::rule_set::Action;

    use super::*;
    use newtypes::VendorAPI::{self, *};
    use test_case::test_case;
    fn make_oebr(vendor_api: VendorAPI, action: Option<Action>) -> Option<OnboardingEvaluationResult> {
        Some(OnboardingEvaluationResult {
            rules_triggered: vec![],
            rules_not_triggered: vec![],
            triggered_action: action,
            vendor_api,
        })
    }

    #[test_case(make_oebr(IdologyExpectID, Some(Action::Fail)), None => Ok(make_oebr(IdologyExpectID, Some(Action::Fail)).unwrap()); "idology fails, no experian => fails")]
    #[test_case(make_oebr(IdologyExpectID, Some(Action::Fail)), make_oebr(ExperianPreciseID, Some(Action::Fail)) => Ok(make_oebr(ExperianPreciseID, Some(Action::Fail)).unwrap()); "both fail => fails")]
    #[test_case(make_oebr(IdologyExpectID, Some(Action::Fail)), make_oebr(ExperianPreciseID, Some(Action::StepUp)) => Ok(make_oebr(ExperianPreciseID, Some(Action::StepUp)).unwrap()); "idology fails, experian steps up => steps up")]
    #[test_case(make_oebr(IdologyExpectID, Some(Action::StepUp)), make_oebr(ExperianPreciseID, Some(Action::StepUp)) => Ok(make_oebr(ExperianPreciseID, Some(Action::StepUp)).unwrap()); "both step up => stepup")]
    #[test_case(make_oebr(IdologyExpectID, None), make_oebr(ExperianPreciseID, Some(Action::StepUp)) => Ok(make_oebr(IdologyExpectID, None).unwrap()); "idology passes, experain steps up => pass")]
    #[test_case(make_oebr(IdologyExpectID, None), make_oebr(ExperianPreciseID, Some(Action::Fail)) => Ok(make_oebr(IdologyExpectID, None).unwrap()); "idology passes, experian fails => pass")]
    #[test_case(make_oebr(IdologyExpectID, Some(Action::StepUp)), make_oebr(ExperianPreciseID, None) => Ok(make_oebr(ExperianPreciseID, None).unwrap()); "experian passes, idology steps up => pass")]
    #[test_case(make_oebr(IdologyExpectID, Some(Action::Fail)), make_oebr(ExperianPreciseID, None) => Ok(make_oebr(ExperianPreciseID, None).unwrap()); "experian  passes, idology fails => pass")]
    fn test_get_kyc_rules_result(
        idology_result: Option<OnboardingEvaluationResult>,
        experian_result: Option<OnboardingEvaluationResult>,
    ) -> Result<OnboardingEvaluationResult, RuleError> {
        super::get_kyc_rules_result(
            vec![experian_result, idology_result]
                .into_iter()
                .flatten()
                .collect(),
        )
    }
}
