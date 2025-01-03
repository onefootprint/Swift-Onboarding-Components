use crate::BusinessDataKind as BDK;
use crate::DataIdentifier as DI;
use itertools::chain;
use paperclip::v2::schema::Apiv2Schema;
use strum::IntoEnumIterator;

/// Bootstrap data mostly consistents of DataIdentifiers, but there are a few additional keys that
/// are only able to be passed when bootstrapping
#[derive(Debug, Clone, serde_with::SerializeDisplay, serde_with::DeserializeFromStr, PartialEq, Eq, Hash)]
pub enum BootstrapKey {
    Di(DI),
    Additional(AdditionalBootstrapKey),
}

#[derive(
    Debug, Clone, PartialEq, Eq, Hash, strum_macros::EnumString, strum_macros::Display, strum_macros::EnumIter,
)]
pub enum AdditionalBootstrapKey {
    #[strum(serialize = "business.primary_owner_stake")]
    BusinessPrimaryOwnerStake,
    #[strum(serialize = "business.secondary_owners")]
    BusinessSecondaryOwners,
}

impl AdditionalBootstrapKey {
    pub fn value_schema(&self) -> paperclip::v2::models::DefaultSchemaRaw {
        match self {
            Self::BusinessPrimaryOwnerStake => i64::raw_schema(),
            // TODO this is incorrect, but we want to migrate the representation anyways
            Self::BusinessSecondaryOwners => Vec::<serde_json::Value>::raw_schema(),
        }
    }
}

impl std::fmt::Display for BootstrapKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Di(di) => write!(f, "{}", di),
            Self::Additional(addl) => write!(f, "{}", addl),
        }
    }
}

impl BootstrapKey {
    pub fn allows_bootstrap(&self) -> bool {
        #[allow(clippy::match_like_matches_macro)]
        match self {
            Self::Di(di) => match di {
                DI::Business(BDK::BeneficialOwnerData(..))
                | DI::Business(BDK::BeneficialOwnerStake(..))
                | DI::Business(BDK::BeneficialOwnerExplanationMessage)
                | DI::Card(_)
                | DI::InvestorProfile(_)
                | DI::Custom(_)
                | DI::Bank(_)
                | DI::Document(_) => false,
                _ => true,
            },
            _ => true,
        }
    }

    pub fn api_examples() -> impl Iterator<Item = Self> {
        chain!(
            AdditionalBootstrapKey::iter().map(Self::Additional),
            DI::api_examples().map(Self::Di)
        )
        .filter(|x| x.allows_bootstrap())
    }

    pub fn value_schema(&self) -> paperclip::v2::models::DefaultSchemaRaw {
        match self {
            Self::Di(di) => di.value_schema(),
            Self::Additional(addl) => addl.value_schema(),
        }
    }
}

impl std::str::FromStr for BootstrapKey {
    type Err = strum::ParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let parse = || {
            if let Ok(di) = DI::from_str(s) {
                return Ok(Self::Di(di));
            }
            AdditionalBootstrapKey::from_str(s)
                .map(Self::Additional)
                .map_err(|_| strum::ParseError::VariantNotFound)
        };
        let result = parse()?;
        if !result.allows_bootstrap() {
            return Err(strum::ParseError::VariantNotFound);
        }
        Ok(result)
    }
}

impl paperclip::v2::schema::Apiv2Schema for BootstrapKey {
    fn name() -> Option<String> {
        Some("BootstrapKey".to_string())
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let mut schema = DI::raw_schema();
        schema.enum_ = Self::api_examples()
            .map(|id| serde_json::Value::String(id.to_string()))
            .collect();
        schema.name = Self::name();
        schema
    }
}


#[cfg(test)]
mod test {
    use crate::BootstrapKey;
    use itertools::Itertools;
    use test_case::test_case;

    #[test]
    fn test_api_examples() {
        let examples = BootstrapKey::api_examples().map(|x| x.to_string()).collect_vec();

        assert!(!examples
            .iter()
            .any(|x| x.starts_with("business.beneficial_owners.")));
        assert!(examples.contains(&"business.primary_owner_stake".to_string()));
        assert!(examples.contains(&"business.secondary_owners".to_string()));
    }

    #[test_case("business.primary_owner_stake")]
    #[test_case("business.secondary_owners")]
    #[test_case("id.first_name")]
    fn test_serialization(value: &str) {
        let key: BootstrapKey = value.parse().unwrap();
        assert_eq!(key.to_string(), value);
    }

    #[test_case("business.beneficial_owners.1.ownership_stake")]
    #[test_case("business.beneficial_owners.1.id.first_name")]
    #[test_case("business.beneficial_owner_explanation_message")]
    #[test_case("custom.flerp")]
    #[test_case("document.drivers_license.front.image")]
    #[test_case("card.test.number")]
    #[test_case("bank.test.ach_routing_number")]
    fn test_cannot_bootstrap(value: &str) {
        assert!(value.parse::<BootstrapKey>().is_err());
    }
}
