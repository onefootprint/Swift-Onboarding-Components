use chrono::DateTime;
use chrono::Utc;
use newtypes::scrub_pii_value;
use newtypes::PiiJsonValue;
use newtypes::ScrubbedPiiString;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct BusinessResponse {
    pub object: Option<String>,
    pub id: Option<String>,
    pub external_id: Option<String>,
    pub name: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub status: Option<String>,
    pub tin: Option<Tin>,
    pub formation: Option<Formation>,
    pub registrations: Option<Vec<Registration>>,
    pub names: Option<Vec<Name>>,
    pub addresses: Option<Vec<Address>>,
    pub review: Option<Review>,
    pub website: Option<Website>,
    pub watchlist: Option<Watchlist>,
    pub people: Option<Vec<Person>>,
    pub profiles: Option<Vec<Profile>>,
    pub policy_results: Option<Vec<PolicyResult>>,
    pub documents: Option<Vec<Document>>,
    pub subscription: Option<Subscription>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub bankruptcies: Option<PiiJsonValue>, /* This is a premium feature we aren't using, and the schema
                                             * is also not really specified by Middesk */
    pub phone_numers: Option<Vec<PhoneNumber>>,
    pub industry_classification: Option<IndustryClassification>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub liens: Option<PiiJsonValue>, // premium feature we aren't using
    pub tags: Option<Vec<String>>,
    pub fmcsa_registrations: Option<Vec<FmcsaRegistration>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Tin {
    pub object: Option<String>,
    pub updated_at: Option<DateTime<Utc>>,
    pub id: Option<String>,
    pub business_id: Option<String>,
    pub name: Option<String>,
    pub tin: Option<ScrubbedPiiString>,
    pub mismatch: Option<bool>,
    pub unknown: Option<bool>,
    pub verified: Option<bool>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Formation {
    pub entity_type: Option<String>,
    pub formation_date: Option<String>,
    pub formation_state: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Registration {
    pub object: Option<String>,
    pub id: Option<String>,
    pub business_id: Option<String>,
    pub name: Option<String>,
    pub status: Option<String>,
    pub sub_status: Option<String>,
    pub status_details: Option<String>,
    pub entity_type: Option<String>,
    pub file_number: Option<String>,
    pub addresses: Option<Vec<String>>,
    pub jurisdiction: Option<String>,
    pub officers: Option<Vec<Officer>>,
    pub registration_date: Option<String>,
    pub state: Option<String>,
    pub source: Option<String>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub registered_agent: Option<PiiJsonValue>, // not in docs, but in response
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Officer {
    pub name: Option<ScrubbedPiiString>,
    pub roles: Option<Vec<String>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Name {
    pub object: Option<String>,
    pub id: Option<String>,
    pub name: Option<ScrubbedPiiString>,
    pub submitted: Option<bool>,
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub business_id: Option<String>,
    pub sources: Option<Vec<Source>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Source {
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub metadata: Option<SourceMetadata>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct SourceMetadata {
    pub file_number: Option<String>,
    pub state: Option<String>,
    pub website: Option<String>,
    pub jurisdiction: Option<String>,
    pub status: Option<String>,
    pub submitted: Option<bool>,
    pub name: Option<String>,
    pub city: Option<String>,
    pub postal_code: Option<String>,
    pub full_address: Option<String>,
    pub address_line1: Option<String>,
    pub address_line2: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Address {
    pub address_line1: Option<String>,
    pub address_line2: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub postal_code: Option<String>,
    pub full_address: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub property_type: Option<String>,
    pub sources: Option<Vec<Source>>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Review {
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub tasks: Option<Vec<Task>>,
    pub assignee: Option<Assignee>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Assignee {
    pub object: Option<String>,
    pub id: Option<String>,
    pub name: Option<String>,
    pub email: Option<String>,
    pub roles: Vec<String>,
    pub image_url: Option<String>,
    pub last_login_at: Option<DateTime<Utc>>,
    pub settings: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Task {
    pub key: Option<String>,
    pub category: Option<String>,
    pub label: Option<String>,
    pub sub_label: Option<String>,
    pub status: Option<String>,
    pub message: Option<String>,
    pub name: Option<String>,
    pub sources: Option<Vec<Source>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Website {
    pub business_id: Option<String>,
    pub object: Option<String>,
    pub id: Option<String>,
    pub url: Option<String>,
    pub status: Option<String>,
    pub pages: Option<Vec<Page>>,
    pub parked: Option<bool>,
    pub domain: Option<Domain>,
    pub title: Option<String>,
    pub description: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub business_name_match: Option<bool>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub phone_numbers: Option<PiiJsonValue>, // schema not specified in docs
    #[serde(serialize_with = "scrub_pii_value")]
    pub addresses: Option<PiiJsonValue>, // schema not specified in docs
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Page {
    pub category: Option<String>,
    pub url: Option<String>,
    pub text: Option<String>,
    pub screenshot_url: Option<String>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Domain {
    pub domain: Option<String>,
    pub creation_date: Option<DateTime<Utc>>,
    pub expiration_date: Option<DateTime<Utc>>,
    pub registrar: Option<Registrar>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Registrar {
    pub name: Option<String>,
    pub organization: Option<String>,
    pub url: Option<String>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Watchlist {
    pub id: Option<String>,
    pub object: Option<String>,
    pub lists: Option<Vec<List>>,
    pub hit_count: Option<i32>,
    pub agencies: Option<Vec<Agency>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct List {
    pub abbr: Option<String>,
    pub title: Option<String>,
    pub agency: Option<String>,
    pub agency_abbr: Option<String>,
    pub organization: Option<String>,
    pub results: Option<Vec<Result>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Result {
    pub id: Option<String>,
    pub object: Option<String>,
    pub listed_at: Option<DateTime<Utc>>,
    pub entity_name: Option<ScrubbedPiiString>,
    pub entity_aliases: Option<Vec<ScrubbedPiiString>>,
    pub agency_list_url: Option<String>,
    pub agency_information_url: Option<String>,
    pub score: Option<String>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub addresses: Option<PiiJsonValue>, /* schema not specified in docs and wierdly its a vec of json
                                          * objects */
    pub url: Option<String>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Agency {
    pub abbr: Option<String>,
    pub name: Option<String>,
    pub org: Option<String>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Person {
    pub name: Option<String>,
    pub titles: Option<Vec<Title>>,
    pub submitted: Option<bool>,
    pub sources: Option<Vec<Source>>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub kyc: Option<PiiJsonValue>, // We are not using Middesk for KYC so this should never be set
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Title {
    pub object: Option<String>,
    pub title: Option<String>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Profile {
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub external_id: Option<String>,
    pub url: Option<String>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub metadata: Option<PiiJsonValue>, // not given a schema in Middesk docs
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct PolicyResult {
    pub object: Option<String>,
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub result: Option<String>,
    pub business_id: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub name: Option<String>,
    pub policy_enabled: Option<bool>,
    pub matched: Option<bool>,
    pub details: Option<serde_json::Value>, // schema not specified by Middesk :|
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Document {
    pub document_type: Option<String>,
    pub filename: Option<String>,
    pub content_type: Option<String>,
    pub size: Option<i64>,
    pub download_url: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub source: Option<Source>,
    pub filing_date: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Subscription {
    pub object: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub event_types: Option<Vec<EventType>>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct EventType {
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct PhoneNumber {
    pub object: Option<String>,
    pub phone_number: Option<ScrubbedPiiString>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct IndustryClassification {
    pub object: Option<String>,
    pub id: Option<String>,
    pub status: Option<String>,
    pub categories: Option<Vec<Category>>,
    pub website: Option<Website>,
    pub created_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Category {
    pub name: Option<String>,
    pub sector: Option<String>,
    pub category: Option<String>,
    pub score: Option<f64>,
    pub high_risk: Option<bool>,
    pub naics_codes: Option<Vec<String>>,
    pub sic_codes: Option<Vec<String>>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct FmcsaRegistration {
    pub object: Option<String>,
    pub id: Option<String>,
    pub dot_number: Option<String>,
    pub legal_name: Option<String>,
    pub dba_name: Option<String>,
    pub source: Option<Source>,
    pub addresses: Option<Vec<String>>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deser() {
        let br: BusinessResponse =
            serde_json::from_value(crate::test_fixtures::middesk_business_response()).unwrap();
        assert_eq!(
            "bankruptcies".to_owned(),
            br.review.unwrap().tasks.unwrap().pop().unwrap().key.unwrap()
        );
    }
}
