use newtypes::FootprintReasonCode as FRC;

pub struct MiscReasonCodeConfig {
    pub user_is_labeled_fraud: bool,
}
pub fn footprint_reason_codes(misc_config: MiscReasonCodeConfig) -> Vec<FRC> {
    let mut reason_codes = vec![];
    if misc_config.user_is_labeled_fraud {
        reason_codes.push(FRC::UserIsLabeledFraud);
    }
    reason_codes
}
