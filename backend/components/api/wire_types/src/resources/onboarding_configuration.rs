use crate::*;
use newtypes::{
    ApiKeyStatus,
    AppClipExperienceId,
    AuthMethodKind,
    CipKind,
    CollectedDataOption,
    DocumentAndCountryConfiguration,
    DocumentRequestConfig,
    EnhancedAml,
    Iso3166TwoDigitCountryCode,
    ObConfigurationId,
    ObConfigurationKey,
    ObConfigurationKind,
    TenantId,
    VerificationCheck,
};

/// OnboardingConfiguration that was created
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct OnboardingConfiguration {
    pub id: ObConfigurationId,
    pub name: String,
    pub key: ObConfigurationKey,
    pub is_live: bool,
    pub created_at: DateTime<Utc>,
    pub status: ApiKeyStatus,
    pub must_collect_data: Vec<CollectedDataOption>,
    pub optional_data: Vec<CollectedDataOption>,
    pub can_access_data: Vec<CollectedDataOption>,
    pub allow_international_residents: bool,
    pub international_country_restrictions: Option<Vec<Iso3166TwoDigitCountryCode>>,
    pub allow_us_residents: bool,
    pub allow_us_territory_residents: bool,
    pub is_no_phone_flow: bool,
    pub is_doc_first_flow: bool,
    pub author: Option<Actor>,
    pub skip_kyc: bool,
    pub skip_kyb: bool,
    pub skip_confirm: bool,
    pub enhanced_aml: EnhancedAml,
    pub doc_scan_for_optional_ssn: Option<CollectedDataOption>,
    pub kind: ObConfigurationKind,
    pub is_rules_enabled: bool,
    pub document_types_and_countries: Option<DocumentAndCountryConfiguration>,
    pub rule_set: Option<RuleSet>, /* theoretically we have a RuleSet for every OBC but this might not
                                    * always be the case (ie mb Auth playbooks won't always have this?)
                                    * and just to be a bit more defensive about a super important model
                                    * here we make it optional (avoid nasty potential errors in inner
                                    * joining on rule_set on OBC queries and such which is a wide blast
                                    * radius for just this rule set version stuff here) */
    pub cip_kind: Option<CipKind>,
    pub documents_to_collect: Vec<DocumentRequestConfig>,
    pub curp_validation_enabled: bool,
    pub verification_checks: Vec<VerificationCheck>,
}

/// The public onboarding configuration
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

pub struct PublicOnboardingConfiguration {
    pub name: String,
    pub key: ObConfigurationKey,
    pub org_id: TenantId,
    pub org_name: String,
    pub logo_url: Option<String>,
    pub privacy_policy_url: Option<String>,
    pub is_live: bool,
    pub status: ApiKeyStatus,

    pub is_app_clip_enabled: bool,
    pub is_instant_app_enabled: bool,
    pub app_clip_experience_id: AppClipExperienceId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub doc_scan_required_if_ssn_skipped: Option<bool>,

    pub is_no_phone_flow: bool,
    pub requires_id_doc: bool,
    pub can_make_real_doc_scan_calls_in_sandbox: bool,
    pub is_kyb: bool,
    pub allow_international_residents: bool,
    pub supported_countries: Vec<Iso3166TwoDigitCountryCode>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub appearance: Option<serde_json::Value>,

    #[serde(skip_serializing_if = "Option::is_none")]
    /// allow list of origins permitted to host the embedded flow
    pub allowed_origins: Option<Vec<String>>,
    pub is_stepup_enabled: bool,
    pub kind: ObConfigurationKind,

    pub support_email: Option<String>,
    pub support_phone: Option<String>,
    pub support_website: Option<String>,

    /// When non-null, the provided auth methods are required to be verified by the playbook. Null
    /// does not mean that no auth is required - it just means the playbook doesn't care which
    /// method is used.
    pub required_auth_methods: Option<Vec<AuthMethodKind>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nid_enabled: Option<bool>,
}
