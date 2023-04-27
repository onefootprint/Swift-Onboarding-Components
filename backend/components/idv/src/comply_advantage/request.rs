use super::error as ComplyAdvantageError;
use newtypes::{IdvData, PiiString};

#[derive(Debug, Clone, serde::Serialize)]
pub struct ComplyAdvantageSearch {
    pub search_term: SearchTerm,
    pub fuzziness: f32,
    pub filters: Option<SearchFilters>,
    pub limit: i32,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct SearchTerm {
    pub first_name: PiiString,
    pub last_name: PiiString,
}

impl TryFrom<&IdvData> for SearchTerm {
    type Error = ComplyAdvantageError::Error;

    fn try_from(data: &IdvData) -> Result<Self, Self::Error> {
        let first_name = data
            .first_name
            .clone()
            .ok_or(ComplyAdvantageError::ConversionError::MissingFirstName)?;
        let last_name = data
            .last_name
            .clone()
            .ok_or(ComplyAdvantageError::ConversionError::MissingFirstName)?;

        Ok(SearchTerm {
            first_name,
            last_name,
        })
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct SearchFilters {
    // types of searches, see: https://docs.complyadvantage.com/api-docs/#filters-in-searches
    pub types: Option<Vec<String>>,
    // Year of birth, if known
    pub birth_year: Option<i32>,
    // A flag which when set, removes deceased people from search results. "1" or "0"
    pub remove_deceased: Option<String>,
    // Array of ISO 3166-1 alpha-2 strings
    pub country_codes: Option<Vec<String>>,
    // String (one of):
    // "person"
    // "company"
    // "organisation"
    // "vessel"
    // "aircraft"
    //
    // Note: Entity type filter is not a hard filter between different entity types. It only optimizes the matching logic to the relevant entity type.
    pub entity_type: Option<String>,
}
