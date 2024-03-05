use crate::{
    enclave_client::EnclaveClient,
    errors::ApiResult,
    utils::vault_wrapper::{DecryptUncheckedResult, VaultWrapper},
    ApiErrorKind,
};
use chrono::{Datelike, Days, NaiveDate, Utc};
use db::models::{ob_configuration::ObConfiguration, risk_signal::NewRiskSignalInfo};
use newtypes::{
    CollectedData, DataIdentifier, Declaration, FootprintReasonCode, IdentityDataKind, InvestorProfileKind,
    PiiString, VendorAPI, VerificationResultId, VisaKind, DATE_FORMAT,
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
    let fields = &[
        DataIdentifier::Id(IdentityDataKind::VisaKind),
        DataIdentifier::Id(IdentityDataKind::VisaExpirationDate),
        DataIdentifier::Id(IdentityDataKind::Dob),
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

    if !vw.has_field(IdentityDataKind::PhoneNumber) {
        frcs.push(FootprintReasonCode::PhoneNotProvided);
    }

    if let Ok(dob) = decrypted.get_di(IdentityDataKind::Dob) {
        if let Ok(is_over_18) = age_gte(dob, 18) {
            if !is_over_18 {
                frcs.push(FootprintReasonCode::DobInputAgeLessThan18)
            }
        }
    }

    frcs
}

fn age_gte(dob: PiiString, age_to_check: i32) -> ApiResult<bool> {
    // from the vault so should be valid age
    let dob = NaiveDate::parse_from_str(dob.leak(), DATE_FORMAT)
        .map_err(|_| ApiErrorKind::AssertionError("not a valid date".to_string()))?;
    let age_helper = AgeHelper { dob };
    let today = Utc::now().naive_utc().into();


    Ok(age_helper.age_is_gte(today, age_to_check))
}


// A struct that helps with ages
pub struct AgeHelper {
    pub dob: NaiveDate,
}
impl AgeHelper {
    pub fn age_is_gte(&self, today: NaiveDate, age_to_check: i32) -> bool {
        // if there haven't been enough years, that's easy
        let difference_from_today_in_years = today.year() - self.dob.year();
        match difference_from_today_in_years.cmp(&age_to_check) {
            // not enough years
            std::cmp::Ordering::Less => false,
            // we're in the bday year
            std::cmp::Ordering::Equal => {
                match today.month0().cmp(&self.dob.month0()) {
                    // we're before the bday
                    std::cmp::Ordering::Less => false,
                    // we're in bday month
                    std::cmp::Ordering::Equal => {
                        match today.day0().cmp(&self.dob.day0()) {
                            // we're before the bday
                            std::cmp::Ordering::Less => false,
                            // happy bday
                            std::cmp::Ordering::Equal => true,
                            // happy belated
                            std::cmp::Ordering::Greater => true,
                        }
                    }
                    // we're in a month after
                    std::cmp::Ordering::Greater => true,
                }
            }
            // we're gt than 18 years
            std::cmp::Ordering::Greater => true,
        }
    }
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

    #[test_case("1990-01-01", "2021-01-01", 18 => true; "older than 18")]
    #[test_case("1990-01-01", "2008-01-01", 60 => false; "not older than year provided")]
    #[test_case("1990-01-01", "2008-01-01", 18 => true; "bday")]
    #[test_case("1990-01-01", "2007-12-31", 18 => false; "day before 18th bday")]
    #[test_case("2004-02-29", "2022-03-01", 18 => true; "dob year is leap year, today is day after bday in non-leap year")]
    #[test_case("2004-02-29", "2022-02-28", 18 => false; "dob year is leap year, today is day before bday in non- leap year")]
    #[test_case("2004-02-29", "2022-03-01", 18 => true; "dob year is leap year, day after bday in non-leap year")]
    #[test_case("2006-02-28", "2024-02-29", 18 => true; "day after bday, current year leap year")]
    #[test_case("2024-02-28", "2022-02-28", 18 => false; "dob after today")]
    fn test_age_is_gt(dob: &str, now: &str, age_to_check: i32) -> bool {
        let dob = NaiveDate::parse_from_str(dob, "%Y-%m-%d").unwrap();
        let now = NaiveDate::parse_from_str(now, "%Y-%m-%d").unwrap();
        let age_helper = AgeHelper { dob };
        age_helper.age_is_gte(now, age_to_check)
    }
}
