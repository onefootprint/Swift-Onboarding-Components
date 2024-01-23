use crate::{enclave_client::EnclaveClient, errors::ApiResult, utils::vault_wrapper::VaultWrapper};
use chrono::{Days, NaiveDate, Utc};
use db::models::{ob_configuration::ObConfiguration, risk_signal::NewRiskSignalInfo};
use newtypes::{
    CollectedData, DataIdentifier, Declaration, FootprintReasonCode, IdentityDataKind, InvestorProfileKind,
    PiiString, VendorAPI, VerificationResultId, VisaKind,
};
use std::str::FromStr;

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

    let fields = &[
        DataIdentifier::Id(IdentityDataKind::VisaKind),
        DataIdentifier::Id(IdentityDataKind::VisaExpirationDate),
        InvestorProfileKind::Declarations.into(),
    ];
    let decrypted = vw.decrypt_unchecked(enclave_client, fields).await?;

    if let Ok(declarations) = decrypted.get_di(InvestorProfileKind::Declarations) {
        let declarations: Vec<Declaration> = declarations.deserialize()?;
        if declarations.contains(&Declaration::AffiliatedWithUsBroker) {
            reason_codes.push(FootprintReasonCode::AffiliatedWithBrokerOrFinra)
        }
    }

    // Visa features
    let kind = decrypted.get_di(IdentityDataKind::VisaKind).ok();
    let visa_expiration = decrypted.get_di(IdentityDataKind::VisaExpirationDate).ok();
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
) -> ApiResult<Vec<FootprintReasonCode>> {
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
