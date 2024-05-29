use idv::incode::curp_validation::response::{
    CurpValidationResponse,
    RenapoError,
};
use newtypes::FootprintReasonCode as FRC;

pub fn footprint_reason_codes(res: &CurpValidationResponse) -> Vec<FRC> {
    match (res.renapo_valid, res.error.as_ref()) {
        (Some(true), _) => vec![FRC::CurpValid],
        (Some(false), None) => vec![FRC::CurpNotValid],
        (Some(false), Some(error)) => match error.curp_error() {
            RenapoError::CurpNotFoundInDatabase => vec![FRC::CurpNotValid],
            RenapoError::MalformedCurpKey => vec![FRC::CurpCouldNotValidate, FRC::CurpMalformed],
            RenapoError::MultipleResultsForData => vec![FRC::CurpMultipleResultsForData, FRC::CurpNotValid],
            RenapoError::ServiceNotAvailable => vec![FRC::CurpCouldNotValidate, FRC::CurpServiceNotAvailable],
            _ => vec![FRC::CurpCouldNotValidate],
        },
        _ => vec![FRC::CurpCouldNotValidate],
    }
}
