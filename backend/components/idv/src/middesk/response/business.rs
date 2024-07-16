use chrono::DateTime;
use chrono::Utc;
use itertools::Itertools;
use newtypes::ScrubbedPiiJsonValue;
use newtypes::ScrubbedPiiString;
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;
use strum::Display;
use strum::EnumString;

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
    pub bankruptcies: Option<ScrubbedPiiJsonValue>, /* This is a premium feature we aren't using, and the
                                                     * schema
                                                     * is also not really specified by Middesk */
    pub phone_numers: Option<Vec<PhoneNumber>>,
    pub industry_classification: Option<IndustryClassification>,
    pub liens: Option<ScrubbedPiiJsonValue>, // premium feature we aren't using
    pub tags: Option<Vec<String>>,
    pub fmcsa_registrations: Option<Vec<FmcsaRegistration>>,
}

#[derive(Debug, Hash, PartialEq, Eq)]
pub enum MiddeskSourceIdKey {
    SourceId(String),
    NoSources,
}

impl From<Option<String>> for MiddeskSourceIdKey {
    fn from(value: Option<String>) -> Self {
        match value {
            Some(s) => Self::SourceId(s),
            None => Self::NoSources,
        }
    }
}

impl BusinessResponse {
    // TODO: test
    pub fn people_by_source_id(
        &self,
        source_type: Option<SourceType>,
    ) -> HashMap<MiddeskSourceIdKey, Vec<Person>> {
        self.people
            .clone()
            .unwrap_or_default()
            .into_iter()
            .flat_map(|person| {
                let mut source_ids_for_person: Vec<(MiddeskSourceIdKey, Person)> = person
                    .sources
                    .as_ref()
                    .into_iter()
                    .flatten()
                    .filter(|src| {
                        let src_filter_string = source_type.clone().map(|s| s.to_string());
                        if src_filter_string.is_some() {
                            src.type_ == src_filter_string
                        } else {
                            true
                        }
                    })
                    .map(|src| (src.id.clone().into(), person.clone()))
                    .collect_vec();

                // still include the person if there are no sources found
                if source_ids_for_person.is_empty() {
                    source_ids_for_person.push((MiddeskSourceIdKey::NoSources, person));
                }

                source_ids_for_person
            })
            .collect_vec()
            .into_iter()
            .into_group_map()
    }

    // TODO: test
    pub fn names_by_source_id(
        &self,
        source_type: Option<SourceType>,
    ) -> HashMap<MiddeskSourceIdKey, Vec<Name>> {
        self.names
            .clone()
            .unwrap_or_default()
            .into_iter()
            .flat_map(|name| {
                let mut source_ids_for_name: Vec<(MiddeskSourceIdKey, Name)> = name
                    .sources
                    .as_ref()
                    .into_iter()
                    .flatten()
                    .filter(|src| {
                        let src_filter_string = source_type.clone().map(|s| s.to_string());
                        if src_filter_string.is_some() {
                            src.type_ == src_filter_string
                        } else {
                            true
                        }
                    })
                    .map(|src| (src.id.clone().into(), name.clone()))
                    .collect_vec();

                // still include the name if there are no sources found
                if source_ids_for_name.is_empty() {
                    source_ids_for_name.push((MiddeskSourceIdKey::NoSources, name));
                }

                source_ids_for_name
            })
            .collect_vec()
            .into_iter()
            .into_group_map()
    }
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
    pub file_number: Option<ScrubbedPiiString>,
    pub addresses: Option<Vec<ScrubbedPiiString>>,
    pub jurisdiction: Option<String>,
    pub officers: Option<Vec<Officer>>,
    pub registration_date: Option<String>,
    pub state: Option<String>,
    pub source: Option<String>,
    pub registered_agent: Option<ScrubbedPiiJsonValue>, // not in docs, but in response
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Officer {
    pub name: Option<ScrubbedPiiString>,
    pub roles: Option<Vec<String>>,
}

impl Officer {
    pub fn roles_for_display(&self) -> Option<String> {
        self.roles.clone().map(|r| r.join(", "))
    }
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

impl Name {
    pub fn sources_for_display(&self, include_watchlist: bool) -> Option<String> {
        let sources = self.sources.as_ref()?;
        let res = sources
            .iter()
            .filter_map(|source| {
                let source_type = source
                    .type_
                    .as_ref()
                    .and_then(|s| SourceType::try_from(s.as_str()).ok());

                if !include_watchlist && source_type == Some(SourceType::WatchlistResult) {
                    None
                } else {
                    source.source_for_display()
                }
            })
            .collect_vec()
            .join(", ");

        Some(res)
    }
}

#[derive(EnumString, Debug, Clone, PartialEq, Eq, Display)]
#[strum(serialize_all = "snake_case")]
pub enum SourceType {
    Registration,
    FmcsaRegistration,
    WatchlistResult,
}
#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct Source {
    pub id: Option<String>,
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub metadata: Option<SourceMetadata>,
}

impl Source {
    pub fn source_for_display(&self) -> Option<String> {
        let source_type = self
            .type_
            .clone()
            .and_then(|s| SourceType::try_from(s.as_str()).ok());


        if let Some(st) = source_type {
            match st {
                SourceType::Registration => self
                    .metadata
                    .as_ref()
                    .and_then(|m| m.state.clone())
                    .map(|s| format!("{} - SOS", s)),
                SourceType::FmcsaRegistration => {
                    let dot_number = self.metadata.as_ref().and_then(|m| m.dot_number.clone());

                    Some(format!("FMCSA - dot number: {:?}", dot_number))
                }
                SourceType::WatchlistResult => {
                    let agency = self.metadata.as_ref().and_then(|m| m.agency.clone());

                    Some(format!("Watchlist - agency: {:?}", agency))
                }
            }
        } else {
            // TODO: make this more interesting perhaps?
            self.type_.clone()
        }
    }
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
    pub city: Option<ScrubbedPiiString>,
    pub postal_code: Option<ScrubbedPiiString>,
    pub full_address: Option<ScrubbedPiiString>,
    pub address_line1: Option<ScrubbedPiiString>,
    pub address_line2: Option<ScrubbedPiiString>,
    pub dot_number: Option<String>,
    // watchlist
    pub abbr: Option<String>,
    pub agency: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Address {
    pub address_line1: Option<ScrubbedPiiString>,
    pub address_line2: Option<ScrubbedPiiString>,
    pub city: Option<ScrubbedPiiString>,
    pub state: Option<ScrubbedPiiString>,
    pub postal_code: Option<ScrubbedPiiString>,
    pub full_address: Option<ScrubbedPiiString>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub property_type: Option<String>,
    pub sources: Option<Vec<Source>>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub submitted: Option<bool>,
    pub deliverable: Option<bool>,
    pub cmra: Option<bool>,
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
    pub phone_numbers: Option<ScrubbedPiiJsonValue>, // schema not specified in docs
    pub addresses: Option<ScrubbedPiiJsonValue>,     // schema not specified in docs
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
    pub people: Option<Vec<PeopleWatchlist>>,
}

// hits are only found in the "$.lists.results" field
#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize)]
pub struct PeopleWatchlist {
    pub object: Option<String>,
    pub name: Option<ScrubbedPiiString>,
    pub submitted: Option<bool>,
    pub sources: Option<Vec<Source>>,
    pub titles: Option<Vec<Title>>,
    pub people_bankrupcies: Option<ScrubbedPiiJsonValue>,
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
    pub list_country: Option<String>,
    pub score: Option<String>,
    pub addresses: Option<ScrubbedPiiJsonValue>, /* schema not specified in docs and wierdly its a vec of
                                                  * json
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
    pub name: Option<ScrubbedPiiString>,
    pub titles: Option<Vec<Title>>,
    pub submitted: Option<bool>,
    pub sources: Option<Vec<Source>>,
    pub kyc: Option<ScrubbedPiiJsonValue>, // We are not using Middesk for KYC so this should never be set
}

impl Person {
    pub fn titles_for_display(&self) -> Option<String> {
        self.titles.as_ref().map(|t| {
            t.iter()
                .filter_map(|title| title.title.clone())
                .collect_vec()
                .join(", ")
        })
    }

    pub fn sources_for_display(&self, include_watchlist: bool) -> Option<String> {
        self.sources.as_ref().map(|s| {
            s.iter()
                .filter_map(|source| {
                    let source_type = source
                        .type_
                        .as_ref()
                        .and_then(|s| SourceType::try_from(s.as_str()).ok());

                    if !include_watchlist && source_type == Some(SourceType::WatchlistResult) {
                        None
                    } else {
                        source.source_for_display()
                    }
                })
                .collect_vec()
                .join(", ")
        })
    }
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
    pub metadata: Option<ScrubbedPiiJsonValue>, // not given a schema in Middesk docs
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
    pub source: Option<serde_json::Value>,
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
