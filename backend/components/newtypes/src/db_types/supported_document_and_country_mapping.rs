use std::collections::HashMap;

use crate::{IdDocKind, Iso3166TwoDigitCountryCode};
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb, Eq, PartialEq)]
pub struct SupportedDocumentAndCountryMapping(pub HashMap<Iso3166TwoDigitCountryCode, Vec<IdDocKind>>);

impl SupportedDocumentAndCountryMapping {
    pub fn supported_countries_for_doc_type(&self, doc_type: IdDocKind) -> Vec<Iso3166TwoDigitCountryCode> {
        self.0
            .iter()
            .filter_map(|(country, doc_types)| doc_types.contains(&doc_type).then_some(country))
            .cloned()
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_serialization() {
        let mapping = SupportedDocumentAndCountryMapping(HashMap::from_iter(vec![(
            Iso3166TwoDigitCountryCode::US,
            vec![IdDocKind::DriversLicense],
        )]));
        let ser = serde_json::to_value(mapping.clone()).unwrap();
        let deser: SupportedDocumentAndCountryMapping = serde_json::from_value(ser).unwrap();
        let raw_json = serde_json::json!({"US": ["drivers_license"]});
        let deser2: SupportedDocumentAndCountryMapping = serde_json::from_value(raw_json).unwrap();

        assert_eq!(mapping, deser);
        assert_eq!(mapping, deser2)
    }
}
