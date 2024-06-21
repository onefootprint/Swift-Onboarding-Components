use crate::enclave_client::EnclaveClient;
use crate::utils::vault_wrapper::DecryptUncheckedResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::ApiCoreError;
use crate::FpResult;
use chrono::Days;
use chrono::NaiveDate;
use chrono::Utc;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::NewRiskSignalInfo;
use newtypes::AgeHelper;
use newtypes::CollectedData;
use newtypes::DataIdentifier;
use newtypes::Declaration;
use newtypes::FootprintReasonCode;
use newtypes::IdentityDataKind as IDK;
use newtypes::InvestorProfileKind;
use newtypes::PiiString;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use newtypes::VisaKind;
use newtypes::DATE_FORMAT;
use std::str::FromStr;

// Note: vendor_api/vres_id passed in here is a complete hack because currently RiskSignal's require
// these and we are doing something hacky here by writing non-vendor reason codes as RiskSignal's.
// The vendor_api/vres_id for the KYC call made should be what is passed in here and these risk
// signals will just be attached to that vendor call
pub async fn generate_user_input_risk_signals(
    enclave_client: &EnclaveClient,
    vw: &VaultWrapper,
    obc: &ObConfiguration,
    vendor_api: VendorAPI,
    vres_id: &VerificationResultId,
) -> FpResult<Vec<NewRiskSignalInfo>> {
    let fields = &[
        DataIdentifier::Id(IDK::VisaKind),
        DataIdentifier::Id(IDK::VisaExpirationDate),
        DataIdentifier::Id(IDK::Dob),
        InvestorProfileKind::Declarations.into(),
    ];
    let decrypted = vw.decrypt_unchecked(enclave_client, fields).await?;

    let mut reason_codes = user_input_based_risk_signals(vw, obc, &decrypted);

    if let Ok(declarations) = decrypted.get_di(InvestorProfileKind::Declarations) {
        let declarations: Vec<Declaration> = declarations.deserialize()?;
        if declarations.contains(&Declaration::AffiliatedWithUsBroker) {
            reason_codes.push(FootprintReasonCode::AffiliatedWithBrokerOrFinra)
        }
    }

    // Visa features
    let kind = decrypted.get_di(IDK::VisaKind).ok();
    let visa_expiration = decrypted.get_di(IDK::VisaExpirationDate).ok();
    let now = Utc::now().naive_utc().into();
    let visa_features = visa_features(kind, visa_expiration, now).await?;

    let risk_signals = reason_codes
        .into_iter()
        .chain(visa_features)
        .map(|frc| (frc, vendor_api, vres_id.clone()))
        .collect();
    Ok(risk_signals)
}

struct VisaForFeatures {
    pub kind: Option<VisaKind>,
    pub expiration: Option<NaiveDate>,
}
impl VisaForFeatures {
    pub fn from_values(kind: Option<PiiString>, expiration: Option<PiiString>) -> Self {
        Self {
            kind: kind.as_ref().and_then(|vk| VisaKind::from_str(vk.leak()).ok()),
            expiration: expiration
                .as_ref()
                .and_then(|e| NaiveDate::parse_from_str(e.leak(), "%Y-%m-%d").ok()),
        }
    }
}

// Temporary implementation so that Composer can write rules based on Visa vault data
// Context: https://onefootprint.slack.com/archives/C05U1CAD6FQ/p1705938322463829
async fn visa_features(
    kind: Option<PiiString>,
    expiration: Option<PiiString>,
    now: NaiveDate,
) -> FpResult<Vec<FootprintReasonCode>> {
    let mut frc = vec![];

    let visa = VisaForFeatures::from_values(kind, expiration);

    // Visa is Other
    if visa.kind.map(|k| matches!(k, VisaKind::Other)).unwrap_or(false) {
        frc.push(FootprintReasonCode::VisaIsOther);
    }

    // Visa expires > 90 days from now
    let expiration_time_limit = now.checked_add_days(Days::new(90));
    if expiration_time_limit
        .and_then(|etl| visa.expiration.map(|e| e <= etl))
        .unwrap_or(false)
    {
        frc.push(FootprintReasonCode::VisaExpiredOrExpiringSoon);
    }

    Ok(frc)
}

// TODO move to a more generic util somewhere since some route uses this too
pub fn ssn_optional_and_missing<T>(vw: &VaultWrapper<T>, obc: &ObConfiguration) -> bool {
    let cd = CollectedData::Ssn;
    let cdos = cd.options();
    cdos.iter().any(|cdo| {
        !cdo.required_data_identifiers().iter().all(|di| vw.has_field(di)) && obc.optional_data.contains(cdo)
    })
}

pub fn user_input_based_risk_signals(
    vw: &VaultWrapper,
    obc: &ObConfiguration,
    decrypted: &DecryptUncheckedResult,
) -> Vec<FootprintReasonCode> {
    let mut frcs = Vec::<FootprintReasonCode>::new();

    let ssn_optional_and_missing_and_no_doc_stepup =
        ssn_optional_and_missing(vw, obc) && !obc.should_stepup_to_do_for_optional_ssn();
    if ssn_optional_and_missing_and_no_doc_stepup {
        frcs.push(FootprintReasonCode::SsnNotProvided);
    }

    if !vw.has_field(&IDK::PhoneNumber.into()) {
        frcs.push(FootprintReasonCode::PhoneNotProvided);
    }

    if let Ok(dob) = decrypted.get_di(IDK::Dob) {
        if let Ok(is_over_18) = age_gte(dob, 18) {
            if !is_over_18 {
                frcs.push(FootprintReasonCode::DobInputAgeLessThan18)
            }
        }
    }

    frcs
}

fn age_gte(dob: PiiString, age_to_check: i32) -> FpResult<bool> {
    // from the vault so should be valid age
    let dob = NaiveDate::parse_from_str(dob.leak(), DATE_FORMAT)
        .map_err(|_| ApiCoreError::AssertionError("not a valid date".to_string()))?;
    let age_helper = AgeHelper { dob };
    let today = Utc::now().naive_utc().into();

    Ok(age_helper.age_is_gte(today, age_to_check))
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case("2021-01-01", "2021-01-01", "other" => vec![FootprintReasonCode::VisaIsOther, FootprintReasonCode::VisaExpiredOrExpiringSoon]; "expired already")]
    #[test_case("2021-01-01", "2021-04-01", "other" => vec![FootprintReasonCode::VisaIsOther, FootprintReasonCode::VisaExpiredOrExpiringSoon]; "expiring in 90")]
    #[test_case("2021-01-01", "2021-02-01", "other" => vec![FootprintReasonCode::VisaIsOther, FootprintReasonCode::VisaExpiredOrExpiringSoon]; "expiring soon")]
    #[test_case("2021-01-01", "2050-01-01", "other" => vec![FootprintReasonCode::VisaIsOther])]
    #[test_case("2021-01-01", "2050-01-01", "h1b" => Vec::<FootprintReasonCode>::new())]
    #[tokio::test]
    async fn test_visa_features(now: &str, visa_expiration: &str, kind: &str) -> Vec<FootprintReasonCode> {
        let kind = Some(PiiString::from(kind));
        let exp = Some(PiiString::from(visa_expiration));
        let now = NaiveDate::parse_from_str(now, "%Y-%m-%d").unwrap();
        super::visa_features(kind, exp, now).await.unwrap()
    }
}
