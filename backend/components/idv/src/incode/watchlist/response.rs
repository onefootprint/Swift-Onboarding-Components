use crate::incode::response::Error;
use crate::incode::IncodeClientErrorCustomFailureReasons;
use chrono::DateTime;
use chrono::Utc;
use derive_more::Deref;
use newtypes::scrub_pii_value;
use newtypes::IncodeFailureReason;
use newtypes::IncodeWatchlistResultRef;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::ScrubbedPiiString;

impl IncodeClientErrorCustomFailureReasons for WatchlistResultResponse {
    fn custom_failure_reasons(_error: Error) -> Option<Vec<IncodeFailureReason>> {
        None
    }
}

impl IncodeClientErrorCustomFailureReasons for UpdatedWatchlistResultResponse {
    fn custom_failure_reasons(_error: Error) -> Option<Vec<IncodeFailureReason>> {
        None
    }
}

#[derive(Clone, serde::Deserialize, serde::Serialize, Deref)]
pub struct UpdatedWatchlistResultResponse(pub WatchlistResultResponse);

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct WatchlistResultResponse {
    pub status: Option<String>,
    pub content: Option<Content>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Content {
    pub data: Option<Data>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Data {
    pub id: Option<i32>,
    #[serde(rename = "ref")]
    pub ref_: Option<IncodeWatchlistResultRef>,
    pub filters: Option<Filters>,
    pub hits: Option<Vec<Hit>>,
    pub searcher_id: Option<i32>,
    pub assignee_id: Option<i32>,
    pub match_status: Option<String>,
    pub risk_level: Option<String>,
    pub search_term: Option<ScrubbedPiiString>,
    pub total_hits: Option<i32>,
    pub total_matches: Option<i32>,
    pub updated_at: Option<String>, // dont make this DateTime<Utc>
    pub created_at: Option<String>,
    pub tags: Option<Vec<String>>,
    pub limit: Option<i32>,
    pub offset: Option<i32>,
    pub share_url: Option<String>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Filters {
    pub country_codes: Option<Vec<String>>,
    pub exact_match: Option<bool>,
    pub fuzziness: Option<f32>,
    pub remove_deceased: Option<i32>,
    pub types: Option<Vec<String>>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Hit {
    pub score: Option<f32>,
    pub is_whitelisted: Option<bool>,
    pub match_types: Option<Vec<String>>,
    pub match_type_details: Option<Vec<MatchTypeDetail>>,
    pub doc: Option<Doc>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct MatchTypeDetail {
    pub aml_types: Option<Vec<String>>,
    pub matching_name: Option<ScrubbedPiiString>,
    pub names_matches: Option<Vec<NameMatch>>,
    #[serde(serialize_with = "scrub_pii_value")]
    pub secondary_matches: Option<PiiJsonValue>, // TODO: dunno schema for this bad boy
    pub sources: Option<Vec<String>>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct NameMatch {
    pub match_types: Option<Vec<String>>,
    pub query_term: Option<ScrubbedPiiString>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Doc {
    pub aka: Option<Vec<Aka>>,
    pub fields: Option<Vec<Field>>,
    pub id: Option<String>,
    pub last_updated_utc: Option<DateTime<Utc>>,
    pub media: Option<Vec<Media>>,
    pub name: Option<ScrubbedPiiString>,
    pub sources: Option<Vec<String>>,
    pub types: Option<Vec<String>>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Aka {
    pub name: Option<ScrubbedPiiString>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Field {
    pub name: Option<String>,
    pub source: Option<String>,
    pub tag: Option<String>,
    pub value: Option<ScrubbedPiiString>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Media {
    pub date: Option<DateTime<Utc>>,
    pub pdf_url: Option<String>,
    pub snippet: Option<ScrubbedPiiString>,
    pub title: Option<ScrubbedPiiString>,
    pub url: Option<String>,
}

///
/// LEAKED VERSIONS
///
/// Below is a hack to enable serializing `Hit`'s with the internal PII leaked. By default, we mark
/// pii fields of a vendor response struct with ScrubbedPiiString so that when we serialize the
/// struct to save it in the plaintext `verification_result.response` field in PG, it contains no
/// PII We currently have 1 other use case to serialize a vendor response struct which is to forward
/// Incode's watchlist results in the Alpaca CIP. It's very likely we'll need to format this for the
/// CIP differently and write custom logic to generate a JSON blob in their preferred format so this
/// is possibly a temporary hack anyway. We make duplicate copies of `Hit` and its containing struct
/// which have Pii* instead of ScrubbedPii* fields. In the Alpaca CIP, we can then call hit.leak()
/// and get a LeakedHit which we can serialize with the PII leaked.

impl Hit {
    pub fn leak(self) -> LeakedHit {
        self.into()
    }
}

impl From<Hit> for LeakedHit {
    fn from(value: Hit) -> Self {
        Self {
            score: value.score,
            is_whitelisted: value.is_whitelisted,
            match_types: value.match_types,
            match_type_details: value
                .match_type_details
                .map(|x| x.into_iter().map(|y| y.into()).collect()),
            doc: value.doc.map(|x| x.into()),
        }
    }
}

impl From<MatchTypeDetail> for LeakedMatchTypeDetail {
    fn from(value: MatchTypeDetail) -> Self {
        Self {
            aml_types: value.aml_types,
            matching_name: value.matching_name.map(|x| x.into()),
            names_matches: value
                .names_matches
                .map(|x| x.into_iter().map(|y| y.into()).collect()),
            secondary_matches: value.secondary_matches,
            sources: value.sources,
        }
    }
}

impl From<NameMatch> for LeakedNameMatch {
    fn from(value: NameMatch) -> Self {
        Self {
            match_types: value.match_types,
            query_term: value.query_term.map(|x| x.into()),
        }
    }
}
impl From<Doc> for LeakedDoc {
    fn from(value: Doc) -> Self {
        Self {
            aka: value.aka.map(|x| x.into_iter().map(|y| y.into()).collect()),
            fields: value.fields.map(|x| x.into_iter().map(|y| y.into()).collect()),
            id: value.id,
            last_updated_utc: value.last_updated_utc,
            media: value.media.map(|x| x.into_iter().map(|y| y.into()).collect()),
            name: value.name.map(|x| x.into()),
            sources: value.sources,
            types: value.types,
        }
    }
}
impl From<Aka> for LeakedAka {
    fn from(value: Aka) -> Self {
        Self {
            name: value.name.map(|x| x.into()),
        }
    }
}
impl From<Field> for LeakedField {
    fn from(value: Field) -> Self {
        Self {
            name: value.name,
            source: value.source,
            tag: value.tag,
            value: value.value.map(|x| x.into()),
        }
    }
}
impl From<Media> for LeakedMedia {
    fn from(value: Media) -> Self {
        Self {
            date: value.date,
            pdf_url: value.pdf_url,
            snippet: value.snippet.map(|x| x.into()),
            title: value.title.map(|x| x.into()),
            url: value.url,
        }
    }
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct LeakedHit {
    pub score: Option<f32>,
    pub is_whitelisted: Option<bool>,
    pub match_types: Option<Vec<String>>,
    pub match_type_details: Option<Vec<LeakedMatchTypeDetail>>,
    pub doc: Option<LeakedDoc>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct LeakedMatchTypeDetail {
    pub aml_types: Option<Vec<String>>,
    pub matching_name: Option<PiiString>,
    pub names_matches: Option<Vec<LeakedNameMatch>>,
    pub secondary_matches: Option<PiiJsonValue>,
    pub sources: Option<Vec<String>>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct LeakedNameMatch {
    pub match_types: Option<Vec<String>>,
    pub query_term: Option<PiiString>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct LeakedDoc {
    pub aka: Option<Vec<LeakedAka>>,
    pub fields: Option<Vec<LeakedField>>,
    pub id: Option<String>,
    pub last_updated_utc: Option<DateTime<Utc>>,
    pub media: Option<Vec<LeakedMedia>>,
    pub name: Option<PiiString>,
    pub sources: Option<Vec<String>>,
    pub types: Option<Vec<String>>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct LeakedAka {
    pub name: Option<PiiString>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct LeakedField {
    pub name: Option<String>,
    pub source: Option<String>,
    pub tag: Option<String>,
    pub value: Option<PiiString>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct LeakedMedia {
    pub date: Option<DateTime<Utc>>,
    pub pdf_url: Option<String>,
    pub snippet: Option<PiiString>,
    pub title: Option<PiiString>,
    pub url: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    pub fn test_deser() {
        let raw_res = crate::test_fixtures::incode_watchlist_result_response_large();

        let parsed: WatchlistResultResponse = serde_json::from_value(raw_res).unwrap();
        assert_eq!("success".to_owned(), parsed.status.unwrap());
        let doc = parsed.content.unwrap().data.unwrap().hits.unwrap()[0]
            .clone()
            .doc
            .unwrap();
        assert_eq!(
            vec![
                "adverse-media",
                "adverse-media-v2-terrorism",
                "adverse-media-v2-violence-aml-cft",
                "adverse-media-v2-violence-non-aml-cft",
                "sanction"
            ],
            doc.clone().types.unwrap()
        );

        assert_eq!(
            vec![
                "argentina-ministerio-de-relaciones-exteriores-y-culto-sanciones-de-la-onu",
                "belarus-state-security-agency-list-of-organizations-and-individuals-involved-in-terrorist-activities",
                "belgium-consolidated-list-of-the-national-and-european-sanctions",
                "complyadvantage-adverse-media",
                "dfat-australia-list",
                "europe-sanctions-list",
                "hm-treasury-list",
                "hong-kong-special-administrative-region-sanctions-issued-under-the-un-sanctions-ordinance",
                "ofac-sdn-list",
                "sfm-ukraine",
                "south-africa-targeted-financial-sanctions-list-person",
                "swiss-seco-list",
                "tresor-direction-generale",
                "un-consolidated"
            ],
            doc.sources.unwrap()
        );
    }

    #[test]
    pub fn test_leak_hit() {
        let raw_res = crate::test_fixtures::incode_watchlist_result_response_yes_hits();
        let parsed: WatchlistResultResponse = serde_json::from_value(raw_res).unwrap();

        let hit = parsed.content.unwrap().data.unwrap().hits.unwrap()[0].clone();
        let leaked_hit = hit.leak();

        let json = serde_json::to_value(&leaked_hit).unwrap();
        let s = format!("{}", json);
        assert!(!s.contains("SCRUBBED"));
    }
}
