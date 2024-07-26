use newtypes::FootprintReasonCode;
use twilio::response::lookup::LookupV2Response;

pub fn footprint_reason_codes(res: &LookupV2Response) -> Vec<FootprintReasonCode> {
    if res
        .line_type_intelligence
        .as_ref()
        .and_then(|intel| intel.kind.as_ref().map(|l| l.is_voip()))
        .unwrap_or(false)
    {
        vec![FootprintReasonCode::PhoneNumberLocatedIsVoip]
    } else {
        vec![]
    }
}
