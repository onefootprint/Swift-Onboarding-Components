#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OnboardingStartRequest {
    // countryCode: String, optional. Valid ISO alpha-2 or alpha-3 code of the country, or 'ALL'. This parameter should be used if document needs to be issued by given country. If not specified, general classifier will be used.
    pub country_code: String,
    // externalId: String, optional. Id that identifies user in clients system should be used for externalId.
    pub external_id: Option<String>,
    // configurationId: String, optional. Id of the flow to be used for this onboarding.
    // == flow_id
    pub configuration_id: Option<String>,
    // interviewId: String, optional. InterviewId from a previous onboarding, including it helps get a new token for that id.
    pub interview_id: Option<String>,
    pub language: String,
}

// Other fields
// language: String, optinal. Language code to be used when doing speech to text. Possible values: en-US, es-ES.
// uuid: String, optional. uuid key used in redis, can be used as an alternative to sending interviewId.
// redirectionUrl: String, optional. Url the user will be redirected to after finishing the onboarding successfully.
//
// use below for name<>OCR matching
//  --> customFields: JSON, optional. Used to send any additional information in key value pair format.
