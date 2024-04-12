use idv::neuro_id::response::{Model, NeuroIdAnalyticsResponse};
use newtypes::FootprintReasonCode as FRC;
pub fn footprint_reason_codes(res: &NeuroIdAnalyticsResponse) -> Vec<FRC> {
    let mut frcs = vec![];
    // TODO: rm this
    let automated_fri = res.get_signal_for_model(Model::AutomatedActivity);

    if let Some(a_fri) = automated_fri {
        frcs.push(
            a_fri
                .label
                .map(|l| &l == "true")
                .unwrap_or(false)
                .then_some(FRC::BrowserAutomation),
        )
    }

    frcs.into_iter().flatten().collect()
}
