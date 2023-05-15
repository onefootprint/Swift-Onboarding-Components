use newtypes::{IncodeConfigurationId, IncodeSessionId, PiiString};

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
pub enum DocumentSide {
    Front,
    Back,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingStartRequest {
    // countryCode: String, optional. Valid ISO alpha-2 or alpha-3 code of the country, or 'ALL'. This parameter should be used if document needs to be issued by given country. If not specified, general classifier will be used.
    pub country_code: String,
    // externalId: String, optional. Id that identifies user in clients system should be used for externalId.
    pub external_id: Option<String>,
    // configurationId: String, optional. Id of the flow to be used for this onboarding.
    // == flow_id
    pub configuration_id: Option<IncodeConfigurationId>,
    // interviewId: String, optional. InterviewId from a previous onboarding, including it helps get a new token for that id.
    pub interview_id: Option<IncodeSessionId>,
    pub language: String,
    pub custom_fields: Option<OnboardingStartCustomNameFields>,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddDocumentSideRequest {
    pub base_64_image: PiiString,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingStartCustomNameFields {
    pub first_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
}

/// Consent
///
/// incode requires 2 consents
/// 1) Consent to compute biometric identifiers in order to render their services
/// 2) Consent to use the biometrics and images in order to _improve_ their services
///
/// If a user declines the first we will not send a request to Incode, the second is optional

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddPrivacyConsent {
    pub title: String,
    pub content: String,
    pub status: bool,
}

impl AddPrivacyConsent {
    pub fn new(title: String, content: String) -> Self {
        Self {
            title,
            content,
            // we won't ever send a request to incode if a user has not consent, so we set this always to true
            status: true,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddMLConsent {
    pub status: bool,
}
