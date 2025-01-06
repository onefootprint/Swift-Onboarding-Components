use crate::*;
use newtypes::input::Csv;
use newtypes::ApiKeyStatus;
use newtypes::AuthMethodKind;
use newtypes::CipKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::DocumentAndCountryConfiguration;
use newtypes::DocumentRequestConfig;
use newtypes::EnhancedAml;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::ObConfigurationKind;
use newtypes::VerificationCheck;


#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct CreateOnboardingConfigurationRequest {
    pub name: String,
    pub must_collect_data: Vec<CDO>,
    pub optional_data: Option<Vec<CDO>>,
    /// When provided, used to populate the deprecated `can_access_data` field. When not provided,
    /// can_access_data is computed from must_collect_data and optional_data.
    pub deprecated_can_access_data: Option<Vec<CDO>>,
    pub cip_kind: Option<CipKind>,
    pub is_no_phone_flow: Option<bool>,
    #[serde(default)]
    #[openapi(optional)]
    pub is_doc_first_flow: bool,
    #[serde(default)]
    #[openapi(optional)]
    pub allow_international_residents: bool,
    pub international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    pub skip_kyc: Option<bool>,
    #[serde(default)]
    pub doc_scan_for_optional_ssn: Option<CDO>,
    #[serde(default)]
    pub enhanced_aml: Option<EnhancedAml>,
    // TODO: drop this option
    pub allow_us_residents: Option<bool>,
    // TODO: drop this option
    pub allow_us_territories: Option<bool>,
    pub kind: ObConfigurationKind,
    pub skip_confirm: Option<bool>,
    pub document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    #[serde(default)]
    #[openapi(optional)]
    pub documents_to_collect: Vec<DocumentRequestConfig>,
    #[serde(default)]
    #[openapi(optional)]
    pub business_documents_to_collect: Vec<DocumentRequestConfig>,
    #[serde(default)]
    pub curp_validation_enabled: Option<bool>,
    #[serde(default)]
    pub verification_checks: Option<Vec<VerificationCheck>>,
    #[serde(default)]
    pub required_auth_methods: Option<Vec<AuthMethodKind>>,
    pub prompt_for_passkey: Option<bool>,
}


#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct OnboardingConfigFilters {
    pub status: Option<ApiKeyStatus>,
    pub search: Option<String>,
    pub kinds: Option<Csv<ObConfigurationKind>>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct CopyPlaybookRequest {
    pub name: String,
    /// The target is_live for the copied playbook
    pub is_live: bool,
}
