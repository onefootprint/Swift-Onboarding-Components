use crate::IdDocKind;
use crate::Iso3166TwoDigitCountryCode;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;
use strum::IntoEnumIterator;

// We currently use a similar looking map to drive bifrost requirements, so introduce a newtype here
// This will be deprecated
#[derive(Debug, Clone, Serialize, Eq, PartialEq, derive_more::Deref)]
pub struct SupportedDocumentAndCountryMappingForBifrost(
    pub HashMap<Iso3166TwoDigitCountryCode, Vec<IdDocKind>>,
);

impl SupportedDocumentAndCountryMappingForBifrost {
    pub fn supported_countries_for_doc_type(&self, doc_type: IdDocKind) -> Vec<Iso3166TwoDigitCountryCode> {
        self.0
            .iter()
            .filter_map(|(country, doc_types)| doc_types.contains(&doc_type).then_some(country))
            .cloned()
            .collect()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb, Eq, PartialEq, Default)]
pub struct CountrySpecificDocumentMapping(pub HashMap<Iso3166TwoDigitCountryCode, Vec<IdDocKind>>);

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb, Eq, PartialEq)]
pub struct DocumentAndCountryConfiguration {
    // Documents available in all countries
    pub global: Vec<IdDocKind>,
    // Country specific configurations, could override global document types set
    pub country_specific: CountrySpecificDocumentMapping,
}

impl DocumentAndCountryConfiguration {
    pub fn into_country_mapping_for_bifrost(&self) -> SupportedDocumentAndCountryMappingForBifrost {
        let mut mapping = if self.global.is_empty() {
            HashMap::new()
        } else {
            HashMap::from_iter(
                Iso3166TwoDigitCountryCode::iter().map(|country| (country, self.global.clone())),
            )
        };

        mapping.extend(self.country_specific.0.clone());

        SupportedDocumentAndCountryMappingForBifrost(mapping)
    }
}

// Default is to accept all documents from all countries
impl Default for DocumentAndCountryConfiguration {
    fn default() -> Self {
        Self {
            global: IdDocKind::iter().collect(),
            country_specific: CountrySpecificDocumentMapping::default(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_country_specific_document_mapping_serialization() {
        let mapping = CountrySpecificDocumentMapping(HashMap::from_iter(vec![(
            Iso3166TwoDigitCountryCode::US,
            vec![IdDocKind::DriversLicense],
        )]));
        let ser = serde_json::to_value(mapping.clone()).unwrap();
        let deser: CountrySpecificDocumentMapping = serde_json::from_value(ser).unwrap();
        let raw_json = serde_json::json!({"US": ["drivers_license"]});
        let deser2: CountrySpecificDocumentMapping = serde_json::from_value(raw_json).unwrap();

        assert_eq!(mapping, deser);
        assert_eq!(mapping, deser2)
    }

    #[test]
    fn test_document_and_country_configuration_serialization() {
        let mapping = CountrySpecificDocumentMapping(HashMap::from_iter(vec![(
            Iso3166TwoDigitCountryCode::US,
            vec![IdDocKind::DriversLicense],
        )]));
        let doc_config = DocumentAndCountryConfiguration {
            global: vec![IdDocKind::Passport],
            country_specific: mapping,
        };
        let ser = serde_json::to_value(doc_config.clone()).unwrap();
        let deser: DocumentAndCountryConfiguration = serde_json::from_value(ser).unwrap();
        let raw_json = serde_json::json!(
        {
            "global": ["passport"],
            "country_specific": {
                "US": ["drivers_license"]
            }
        });
        let deser2: DocumentAndCountryConfiguration = serde_json::from_value(raw_json).unwrap();

        assert_eq!(doc_config, deser);
        assert_eq!(doc_config, deser2)
    }
}
