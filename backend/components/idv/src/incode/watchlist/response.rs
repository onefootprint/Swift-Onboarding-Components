use chrono::{DateTime, Utc};
use newtypes::{PiiJsonValue, PiiString};

// impl APIResponseToIncodeError for WatchlistResultResponse {
//     fn to_error(&self) -> Option<Error> {
//         self.error.clone()
//     }
// }

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WatchlistResultResponse {
    pub status: Option<String>,
    pub content: Option<Content>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Content {
    pub data: Option<Data>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Data {
    pub id: Option<i32>,
    #[serde(rename = "ref")]
    pub ref_: Option<PiiString>,
    pub filters: Option<Filters>,
    pub hits: Option<Vec<Hit>>,
    pub searcher_id: Option<i32>,
    pub assignee_id: Option<i32>,
    pub match_status: Option<String>,
    pub risk_level: Option<String>,
    pub search_term: Option<PiiString>,
    pub total_hits: Option<i32>,
    pub total_matches: Option<i32>,
    pub updated_at: Option<DateTime<Utc>>,
    pub created_at: Option<DateTime<Utc>>,
    pub tags: Option<Vec<String>>,
    pub limit: Option<i32>,
    pub offset: Option<i32>,
    pub share_url: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Filters {
    pub country_codes: Option<Vec<String>>,
    pub exact_match: Option<bool>,
    pub fuzziness: Option<f32>,
    pub remove_deceased: Option<i32>,
    pub types: Option<Vec<String>>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Hit {
    pub score: Option<f32>,
    pub is_whitelisted: Option<bool>,
    pub match_types: Option<Vec<String>>,
    pub match_type_details: Option<Vec<MatchTypeDetail>>,
    pub doc: Option<Doc>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchTypeDetail {
    pub aml_types: Option<Vec<String>>,
    pub matching_name: Option<PiiString>,
    pub names_matches: Option<Vec<NameMatch>>,
    pub secondary_matches: Option<PiiJsonValue>, // TODO: dunno schema for this bad boy
    pub sources: Option<Vec<String>>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NameMatch {
    pub match_types: Option<Vec<String>>,
    pub query_term: Option<PiiString>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Doc {
    pub aka: Option<Vec<Aka>>,
    pub fields: Option<Vec<Field>>,
    pub id: Option<String>,
    pub last_updated_utc: Option<DateTime<Utc>>,
    pub media: Option<Vec<Media>>,
    pub name: Option<PiiString>,
    pub sources: Option<Vec<String>>,
    pub types: Option<Vec<String>>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Aka {
    pub name: Option<PiiString>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Field {
    pub name: Option<String>,
    pub source: Option<String>,
    pub tag: Option<String>,
    pub value: Option<PiiString>,
}

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Media {
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
        let raw_res = crate::test_fixtures::incode_watchlist_result_response();

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
}
