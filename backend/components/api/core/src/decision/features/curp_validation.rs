use idv::incode::curp_validation::response::CurpValidationResponse;
use newtypes::FootprintReasonCode as FRC;

pub fn footprint_reason_codes(res: &CurpValidationResponse) -> Vec<FRC> {
    match (res.renapo_valid, res.error.as_ref()) {
        (Some(true), _) => vec![FRC::CurpValid],
        (Some(false), None) => vec![FRC::CurpNotValid],
        (Some(false), Some(error)) => vec![
            error.curp_not_found().then_some(FRC::CurpNotFound),
            Some(FRC::CurpNotValid),
        ]
        .into_iter()
        .flatten()
        .collect(),
        _ => vec![FRC::CurpCouldNotValidate, FRC::CurpNotValid],
    }
}
