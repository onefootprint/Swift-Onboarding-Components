use newtypes::{
    IncodeConfigurationId,
    IncodeSessionId,
    PiiString,
};

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingStartRequest {
    // countryCode: String, optional. Valid ISO alpha-2 or alpha-3 code of the country, or 'ALL'. This
    // parameter should be used if document needs to be issued by given country. If not specified, general
    // classifier will be used.
    pub country_code: String,
    // externalId: String, optional. Id that identifies user in clients system should be used for externalId.
    pub external_id: Option<String>,
    // configurationId: String, optional. Id of the flow to be used for this onboarding.
    // == flow_id
    pub configuration_id: Option<IncodeConfigurationId>,
    // interviewId: String, optional. InterviewId from a previous onboarding, including it helps get a new
    // token for that id.
    pub interview_id: Option<IncodeSessionId>,
    pub language: String,
    pub custom_fields: Option<OnboardingStartCustomNameFields>,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingStartCustomNameFields {
    pub first_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
}
