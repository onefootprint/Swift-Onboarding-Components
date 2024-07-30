use newtypes::FootprintReasonCode;
use twilio::response::lookup::LookupV2Response;

pub fn footprint_reason_codes(res: &LookupV2Response) -> Vec<FootprintReasonCode> {
    if res
        .line_type_intelligence
        .as_ref()
        .and_then(|intel| intel.kind.as_ref().map(|l| l.is_voip()))
        .unwrap_or(false)
    {
        vec![FootprintReasonCode::PhoneNumberIsVoip]
    } else {
        vec![]
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use idv::test_fixtures;
    use twilio::response::lookup::LookupV2Response;

    #[test]
    fn test_reason_codes() {
        let raw = test_fixtures::test_twilio_lookupv2_response();
        let res: LookupV2Response = serde_json::from_value(raw).unwrap();
        let frc = footprint_reason_codes(&res);
        assert_eq!(frc, vec![FootprintReasonCode::PhoneNumberIsVoip]);
    }
}
