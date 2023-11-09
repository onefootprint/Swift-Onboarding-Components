use std::collections::HashMap;

use newtypes::{
    flat_api_object_map_type, DataIdentifier, PiiJsonValue, PiiValueKind, VersionedDataIdentifier,
};

flat_api_object_map_type!(
    DecryptResponse<VersionedDataIdentifier, Option<PiiJsonValue>>,
    description="A key-value map with the corresponding decrypted values",
    example=r#"{ "id.last_name": "doe", "id.ssn9": "121121212", "custom.credit_card": "4242424242424242" }"#
);

impl From<HashMap<DataIdentifier, Option<PiiJsonValue>>> for DecryptResponse {
    fn from(value: HashMap<DataIdentifier, Option<PiiJsonValue>>) -> Self {
        let map: HashMap<_, _> = value
            .into_iter()
            .map(|(di, v)| (VersionedDataIdentifier::new(di), v))
            .collect();
        Self::from(map)
    }
}

impl DecryptResponse {
    /// Some logging for now when a value is in a different serialization format than we expect
    /// Once we see this running in prod for a while and have confidence nobody is decrypting
    /// these legacy values whose serializations have changed from string -> json, we'll backfill
    /// their type to be json and remove this
    pub fn log_invalid_serializations(&self) {
        self.iter().for_each(|(di, v)| {
            if let Some(v) = v {
                let kind = PiiValueKind::from(v);
                if should_be_json(&di.di) && !matches!(kind, PiiValueKind::Object | PiiValueKind::Array) {
                    tracing::error!(di=%di, kind=%kind, "Decrypted value with legacy serialization");
                }
            }
        });
    }
}

fn should_be_json(di: &DataIdentifier) -> bool {
    use newtypes::{BusinessDataKind, IdentityDataKind, InvestorProfileKind};
    matches!(
        di,
        DataIdentifier::Id(IdentityDataKind::Citizenships)
            | DataIdentifier::Business(BusinessDataKind::BeneficialOwners)
            | DataIdentifier::Business(BusinessDataKind::KycedBeneficialOwners)
            | DataIdentifier::InvestorProfile(InvestorProfileKind::InvestmentGoals)
            | DataIdentifier::InvestorProfile(InvestorProfileKind::Declarations)
            | DataIdentifier::InvestorProfile(InvestorProfileKind::SeniorExecutiveSymbols)
            | DataIdentifier::InvestorProfile(InvestorProfileKind::FamilyMemberNames)
    )
}
