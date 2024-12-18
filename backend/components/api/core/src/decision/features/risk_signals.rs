use super::curp_validation;
use super::experian;
use super::idology_expectid;
use super::lexis;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use db::models::risk_signal::NewRiskSignalInfo;
use idv::ParsedResponse;
use newtypes::FootprintReasonCode;
use newtypes::IdentityDataKind as IDK;
use newtypes::VendorAPI;

pub struct ParsedFootprintReasonCodes {
    pub kyc: Vec<NewRiskSignalInfo>,
    pub aml: Vec<NewRiskSignalInfo>,
}

// Helper to use in FRC construction
#[derive(Clone, Copy)]
pub struct UserSubmittedInfoForFRC {
    pub dob: bool,
    pub ssn: bool,
    pub phone: bool,
}

impl UserSubmittedInfoForFRC {
    pub fn new(vw: &VaultWrapper) -> Self {
        let dob = vw.has_field(&IDK::Dob.into());
        let ssn = vw.has_field(&IDK::Ssn4.into()) || vw.has_field(&IDK::Ssn9.into());
        let phone = vw.has_field(&IDK::PhoneNumber.into());
        Self { dob, ssn, phone }
    }
}

pub fn parse_reason_codes_from_vendor_result(
    vendor_result: VendorResult, /* TODO: this could be VendorResponse later when vres_id is removed from
                                  * here */
    vw: &VaultWrapper,
) -> FpResult<ParsedFootprintReasonCodes> {
    let vendor_api: VendorAPI = (&vendor_result.response).into();
    let vres_id = vendor_result.verification_result_id.clone();
    let submitted_info = UserSubmittedInfoForFRC::new(vw);

    let (aml_frcs, kyc_frcs): (Vec<_>, Vec<_>) = parse_reason_codes(vendor_result.clone(), submitted_info)
        .into_iter()
        .partition(|frc| frc.is_aml());

    let kyc = kyc_frcs
        .into_iter()
        .map(|frc| (frc, vendor_api, vres_id.clone()))
        .collect();


    let aml = aml_frcs
        .into_iter()
        .map(|frc| (frc, vendor_api, vres_id.clone()))
        .collect();

    let res = ParsedFootprintReasonCodes { kyc, aml };
    Ok(res)
}

pub fn parse_reason_codes(
    vendor_result: VendorResult,
    submitted_info: UserSubmittedInfoForFRC,
) -> Vec<FootprintReasonCode> {
    let dob_submitted = submitted_info.dob;
    let ssn_submitted = submitted_info.ssn;
    match vendor_result.response {
        ParsedResponse::IDologyExpectID(r) => {
            idology_expectid::footprint_reason_codes(r, dob_submitted, ssn_submitted)
        }
        ParsedResponse::ExperianPreciseID(r) => experian::footprint_reason_codes(r),
        ParsedResponse::LexisFlexId(r) => lexis::footprint_reason_codes(r, submitted_info)
            .into_iter()
            .collect(),
        ParsedResponse::IncodeCurpValidation(ref r) => {
            curp_validation::footprint_reason_codes(r).into_iter().collect()
        }
        _ => vec![],
    }
}
