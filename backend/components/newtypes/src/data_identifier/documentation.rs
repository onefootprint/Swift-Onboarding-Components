use super::bank_data_kind::BankInfo;
use crate::BusinessDataKind;
use crate::CardInfo;
use crate::DataIdentifier;
use crate::DataIdentifierDiscriminant;
use crate::DocumentDiKind;
use crate::IdentityDataKind;
use crate::InvestorProfileKind;
use crate::KvDataKey;
use crate::VaultKind;
use itertools::Itertools;
use paperclip::v2::models::DataType;
use strum::IntoEnumIterator;

impl DataIdentifier {
    /// List of permissible DataIdentifiers to be rendered in documentation
    pub fn api_examples(kinds: Vec<DataIdentifierDiscriminant>) -> Vec<serde_json::Value> {
        kinds
            .into_iter()
            .flat_map(|kind| match kind {
                DataIdentifierDiscriminant::Custom => {
                    vec![DataIdentifier::Custom(KvDataKey::from("*".to_string()))]
                }
                DataIdentifierDiscriminant::Id => IdentityDataKind::iter()
                    .map(DataIdentifier::from)
                    .filter(|di| !di.is_verified_ci())
                    .collect_vec(),
                DataIdentifierDiscriminant::Business => BusinessDataKind::non_bo_variants()
                    .into_iter()
                    .filter(|bdk| !matches!(bdk, BusinessDataKind::BeneficialOwnerExplanationMessage))
                    .map(DataIdentifier::from)
                    .collect_vec(),
                DataIdentifierDiscriminant::InvestorProfile => InvestorProfileKind::iter()
                    .map(DataIdentifier::from)
                    .collect_vec(),
                DataIdentifierDiscriminant::Document => DocumentDiKind::api_examples()
                    .into_iter()
                    .map(DataIdentifier::from)
                    .collect_vec(),
                DataIdentifierDiscriminant::Card => CardInfo::api_examples()
                    .into_iter()
                    .map(DataIdentifier::from)
                    .collect_vec(),
                DataIdentifierDiscriminant::Bank => BankInfo::api_examples()
                    .into_iter()
                    .map(DataIdentifier::from)
                    .collect_vec(),
            })
            .map(|id| serde_json::Value::String(id.to_string()))
            .collect_vec()
    }
}

impl paperclip::v2::schema::Apiv2Schema for DataIdentifier {
    fn name() -> Option<String> {
        Some("DataIdentifier".to_string())
    }

    fn description() -> &'static str {
        "Represents a piece of data stored inside the vault."
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        use paperclip::v2::models::DefaultSchemaRaw;
        DefaultSchemaRaw {
            name: Some("DataIdentifier".into()),
            data_type: Some(DataType::String),
            enum_: Self::api_examples(DataIdentifierDiscriminant::iter().collect()),
            ..Default::default()
        }
    }
}
impl paperclip::actix::OperationModifier for DataIdentifier {}


/// Empty struct used solely to produce documentation specifically for business data identifiers.
pub struct BusinessDataIdentifier;

impl paperclip::v2::schema::Apiv2Schema for BusinessDataIdentifier {
    fn name() -> Option<String> {
        Some("BusinessDataIdentifier".to_string())
    }

    fn description() -> &'static str {
        DataIdentifier::description()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let mut schema = DataIdentifier::raw_schema();
        let dids = DataIdentifierDiscriminant::iter()
            .filter(|did| did.is_allowed_for(VaultKind::Business))
            .collect();
        schema.enum_ = DataIdentifier::api_examples(dids);
        schema
    }
}


/// Empty struct used solely to produce documentation specifically for business data identifiers.
pub struct UserDataIdentifier;

impl paperclip::v2::schema::Apiv2Schema for UserDataIdentifier {
    fn name() -> Option<String> {
        Some("UserDataIdentifier".to_string())
    }

    fn description() -> &'static str {
        DataIdentifier::description()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let mut schema = DataIdentifier::raw_schema();
        let dids = DataIdentifierDiscriminant::iter()
            .filter(|did| did.is_allowed_for(VaultKind::Person))
            .collect();
        schema.enum_ = DataIdentifier::api_examples(dids);
        schema
    }
}
