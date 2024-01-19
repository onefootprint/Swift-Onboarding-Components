use crate::{enclave_client::EnclaveClient, errors::ApiResult, utils::vault_wrapper::VaultWrapper};
use db::models::{ob_configuration::ObConfiguration, risk_signal::NewRiskSignalInfo};
use newtypes::{
    CollectedData, Declaration, FootprintReasonCode, IdentityDataKind, InvestorProfileKind, VendorAPI,
    VerificationResultId,
};

// Note: vendor_api/vres_id passed in here is a complete hack because currently RiskSignal's require these and we are doing something hacky here by writing non-vendor
// reason codes as RiskSignal's. The vendor_api/vres_id for the KYC call made should be what is passed in here and these risk signals will just be attached to that vendor call
pub async fn generate_user_input_risk_signals(
    enclave_client: &EnclaveClient,
    vw: &VaultWrapper,
    obc: &ObConfiguration,
    vendor_api: VendorAPI,
    vres_id: &VerificationResultId,
) -> ApiResult<Vec<NewRiskSignalInfo>> {
    let mut reason_codes = user_input_based_risk_signals(vw, obc);

    let declarations = vw
        .decrypt_unchecked_single(enclave_client, InvestorProfileKind::Declarations.into())
        .await?;

    if let Some(declarations) = declarations {
        let declarations: Vec<Declaration> = declarations.deserialize()?;
        if declarations.contains(&Declaration::AffiliatedWithUsBroker) {
            reason_codes.push(FootprintReasonCode::AffiliatedWithBrokerOrFinra)
        }
    }

    let risk_signals = reason_codes
        .into_iter()
        .map(|frc| (frc, vendor_api, vres_id.clone()))
        .collect();
    Ok(risk_signals)
}

// TODO move to a more generic util somewhere since some route uses this too
pub fn ssn_optional_and_missing<T>(vw: &VaultWrapper<T>, obc: &ObConfiguration) -> bool {
    let cd = CollectedData::Ssn;
    let cdos = cd.options();
    cdos.iter().any(|cdo| {
        !cdo.required_data_identifiers()
            .into_iter()
            .all(|di| vw.has_field(di))
            && obc.optional_data.contains(cdo)
    })
}

pub fn user_input_based_risk_signals(vw: &VaultWrapper, obc: &ObConfiguration) -> Vec<FootprintReasonCode> {
    let mut frcs = Vec::<FootprintReasonCode>::new();

    let ssn_optional_and_missing_and_no_doc_stepup =
        ssn_optional_and_missing(vw, obc) && !obc.should_stepup_to_do_for_optional_ssn();
    if ssn_optional_and_missing_and_no_doc_stepup {
        frcs.push(FootprintReasonCode::SsnNotProvided);
    }

    if !vw.has_field(IdentityDataKind::PhoneNumber) {
        frcs.push(FootprintReasonCode::PhoneNotProvided);
    }
    frcs
}
