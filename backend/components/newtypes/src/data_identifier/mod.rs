//! This module contains all of the different ways that we identify data stored inside of a UserVault.
//! It is a little complex, so we describe all of them here:
//!
//! `DataIdentifier`: the top level identitfier of a piece of data. Given a UVW and a `DataIdentifier`,
//! we should be able to locate the underlying piece of data that is requested. `DataIdentifier`s are
//! also used in access events to designate which pieces of data were decrypted.
//! - `IdentityDataKind`: A subset of DataIdentifier that refers to what we colloquially have been calling
//!   "identity data." This is the set of data that shows up on your virtual, Footprint ID card. It is the
//!   set of data that we send to be verified by our KYC data vendors.
//!    - TODO need to update this
//!    - Identity data is stored inside of a handful of different tables. `VdKind` is a subset of
//!      `IdentityDataKind` that represents data that is stored only in the `UserVaultData` table.
//! - `KvDataKey`: A subset of DataIdentifier that refers to custom, key-value data. A KvDataKey is just
//!    a wrapper around a free-form string.
//!
//! `CollectedData` and `CollectedDataOption` are also tangential - they are used in onboarding
//! configurations to specify the set of dentity data that needs to be collected, and in permissions
//! to represent which pieces of data are allowed to be decrypted/accessed. Each `CollectedData`
//! variant represents a kind of data that can be collected, like Name or Ssn.
//! - Some `CollectedData` variants have multiple configurations of identity data that can be
//!   collected. Those configurations are represented in `CollectedDataOption` - for example, to
//!   collected a `CD::Address`, you could either collected `CDO::PartialAddress` or `CDO::FullAddress`
//! - Some `CollectedDataOption` variants may represent multiple underlying `IdentityDataKind`s -
//!   for example, `CDO::Name` cannot be collected without collecting _both_ `IDK::FirstName` and
//!   `IDK::LastName`.

mod business_data_kind;
mod collected_data;
mod credit_card;
mod document_kind;
mod id_doc_kind;
mod identity_data_kind;
mod investor_profile_kind;
mod kv_data_key;
mod validation;
mod vd_kind;

pub use self::{
    business_data_kind::*, collected_data::*, credit_card::*, document_kind::*, id_doc_kind::*,
    identity_data_kind::*, investor_profile_kind::*, validation::Error as ValidationError, validation::*,
    vd_kind::*,
};
use crate::{util::impl_enum_string_diesel, AliasId, EnumDotNotationError, KvDataKey, PiiString};
use crypto::sha256;
pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use itertools::Itertools;
use paperclip::v2::models::DataType;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::hash::Hash;
use std::str::FromStr;
use strum::IntoEnumIterator;
use strum_macros::{AsRefStr, EnumDiscriminants};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    Clone,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    EnumDiscriminants,
    SerializeDisplay,
    DeserializeFromStr,
)]
#[strum_discriminants(
    name(DataIdentifierDiscriminant),
    vis(pub),
    derive(strum_macros::EnumString, strum_macros::EnumIter),
    strum(serialize_all = "snake_case")
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
/// Represents a piece of data stored inside the user vault.
/// Mostly used in requests to decrypt a piece of data and in access events to show the log of
/// decrypted items.
pub enum DataIdentifier {
    Id(IdentityDataKind),
    Custom(KvDataKey),
    Business(BusinessDataKind),
    InvestorProfile(InvestorProfileKind),
    Document(DocumentKind),
    Card(CardInfo),
}

/// Contains all of the functionality that each nested type of DataIdentifier must provide
pub trait IsDataIdentifierDiscriminant:
    Hash + Eq + Clone + TryFrom<DataIdentifier> + Into<DataIdentifier> + Validate
{
    /// When true, will not be required in order to satisfy the parent CD/CDO
    fn is_optional(&self) -> bool;

    /// Maps the DI variant to the CollectedData variant that contains this DI
    fn parent(&self) -> Option<CollectedData>;
}

impl DataIdentifier {
    /// When true, will not be required in order to satisfy the parent CD/CDO
    fn is_optional(&self) -> bool {
        match self {
            Self::Id(s) => s.is_optional(),
            Self::Custom(s) => s.is_optional(),
            Self::Business(s) => s.is_optional(),
            Self::InvestorProfile(s) => s.is_optional(),
            Self::Document(s) => s.is_optional(),
            Self::Card(s) => s.is_optional(),
        }
    }

    pub fn parent(&self) -> Option<CollectedData> {
        match self {
            Self::Id(s) => s.parent(),
            Self::Custom(s) => s.parent(),
            Self::Business(s) => s.parent(),
            Self::InvestorProfile(s) => s.parent(),
            Self::Document(s) => s.parent(),
            Self::Card(s) => s.parent(),
        }
    }

    /// When true, stores the value of the identifier in plaintext
    /// We really don't want to accidentally add a plain-text-able DI, so we have a test that
    /// breaks if you add a new type and a constraint in the DB that only certain vault_data rows
    /// can have plaintext values.
    /// Only add a new plaintext DI if you are 100% positive that this data doesn't need to be
    /// encrypted.
    pub fn store_plaintext(&self) -> bool {
        matches!(self, Self::Business(BusinessDataKind::Name))
    }

    pub fn globally_unique(&self) -> bool {
        matches!(self, Self::Id(IdentityDataKind::PhoneNumber))
    }
}

impl Validate for DataIdentifier {
    fn validate(&self, value: crate::PiiString, for_bifrost: bool) -> crate::NtResult<crate::PiiString> {
        match self {
            Self::Id(s) => s.validate(value, for_bifrost),
            Self::Custom(s) => s.validate(value, for_bifrost),
            Self::Business(s) => s.validate(value, for_bifrost),
            Self::InvestorProfile(s) => s.validate(value, for_bifrost),
            Self::Document(s) => s.validate(value, for_bifrost),
            Self::Card(s) => s.validate(value, for_bifrost),
        }
    }
}

/// A custom implementation to make the appearance of serialized DataIdentifiers much more reasonable.
/// We serialize DIs as `prefix.suffix`
impl std::fmt::Display for DataIdentifier {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            Self::Id(s) => s.to_string(),
            Self::Custom(s) => s.to_string(),
            Self::Business(s) => s.to_string(),
            Self::InvestorProfile(s) => s.to_string(),
            Self::Document(s) => s.to_string(),
            Self::Card(s) => s.to_string(),
        };
        write!(f, "{}.{}", prefix, suffix)
    }
}

impl DataIdentifier {
    /// List of permissible DataIdentifiers to be rendered in documentation
    fn api_examples() -> Vec<serde_json::Value> {
        DataIdentifierDiscriminant::iter()
            .flat_map(|kind| match kind {
                DataIdentifierDiscriminant::Custom => {
                    vec![DataIdentifier::Custom(KvDataKey::from("*".to_string()))]
                }
                DataIdentifierDiscriminant::Id => {
                    IdentityDataKind::iter().map(DataIdentifier::from).collect_vec()
                }
                DataIdentifierDiscriminant::Business => {
                    BusinessDataKind::iter().map(DataIdentifier::from).collect_vec()
                }
                DataIdentifierDiscriminant::InvestorProfile => InvestorProfileKind::iter()
                    .map(DataIdentifier::from)
                    .collect_vec(),
                DataIdentifierDiscriminant::Document => {
                    DocumentKind::iter().map(DataIdentifier::from).collect_vec()
                }
                DataIdentifierDiscriminant::Card => CardDataKind::iter()
                    .map(|k| {
                        DataIdentifier::from(CardInfo {
                            alias: AliasId::from("*".to_owned()),
                            kind: k,
                        })
                    })
                    .collect_vec(),
            })
            .map(|id| serde_json::Value::String(id.to_string()))
            .collect_vec()
    }
}

impl schemars::JsonSchema for DataIdentifier {
    fn schema_name() -> String {
        "DataIdentifier".to_owned()
    }

    fn json_schema(_gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        schemars::_private::apply_metadata(
            schemars::schema::Schema::Object(schemars::schema::SchemaObject {
                instance_type: Some(schemars::schema::InstanceType::String.into()),
                enum_values: Some(Self::api_examples()),
                ..Default::default()
            }),
            schemars::schema::Metadata {
                description: Some("Represents the kind of data.".to_owned()),
                examples: vec![serde_json::Value::String(
                    DataIdentifier::Id(IdentityDataKind::Ssn9).to_string(),
                )],

                ..Default::default()
            },
        )
    }
}

impl paperclip::v2::schema::Apiv2Schema for DataIdentifier {
    fn name() -> Option<String> {
        Some("DataIdentifier".to_string())
    }

    fn description() -> &'static str {
        "Represents a piece of data stored inside the user vault.\n Mostly used in requests to decrypt a piece of data and in access events to show the log of decrypted items."
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        use paperclip::v2::models::DefaultSchemaRaw;
        DefaultSchemaRaw {
            name: Some("DataIdentifier".into()),
            data_type: Some(DataType::String),
            enum_: Self::api_examples(),
            ..Default::default()
        }
    }
}
impl paperclip::actix::OperationModifier for DataIdentifier {}

/// A custom implementation to make the appearance of serialized DataIdentifiers much more reasonable.
/// We serialize DIs as `prefix.suffix`
impl FromStr for DataIdentifier {
    type Err = EnumDotNotationError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let period_idx = s
            .find('.')
            .ok_or_else(|| EnumDotNotationError::CannotParse(s.to_owned()))?;
        let prefix = &s[..period_idx];
        let suffix = &s[(period_idx + 1)..];
        let prefix = DataIdentifierDiscriminant::from_str(prefix)
            .map_err(|_| EnumDotNotationError::CannotParsePrefix(prefix.to_owned()))?;
        // Parse the suffix differently depending on the prefix
        let cannot_parse_suffix_err = EnumDotNotationError::CannotParseSuffix(suffix.to_owned());
        let result = match prefix {
            DataIdentifierDiscriminant::Id => {
                Self::Id(IdentityDataKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminant::Custom => {
                Self::Custom(KvDataKey::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminant::Business => {
                Self::Business(BusinessDataKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminant::InvestorProfile => Self::InvestorProfile(
                InvestorProfileKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?,
            ),
            DataIdentifierDiscriminant::Document => {
                Self::Document(DocumentKind::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
            DataIdentifierDiscriminant::Card => {
                Self::Card(CardInfo::from_str(suffix).map_err(|_| cannot_parse_suffix_err)?)
            }
        };
        Ok(result)
    }
}

impl DataIdentifier {
    /// Returns true if the DI can be fingerprinted. Will automatically fingerprint non-document
    /// data with these types when added to the vault
    pub fn is_fingerprintable(&self) -> bool {
        match self {
            DataIdentifier::Id(idk) => idk.is_searchable(),
            DataIdentifier::Business(bdk) => bdk.is_searchable(),
            DataIdentifier::Custom(_)
            | DataIdentifier::InvestorProfile(_)
            | DataIdentifier::Document(_)
            | DataIdentifier::Card(_) => false,
        }
    }

    /// collect fingerprintable DIs
    pub fn fingerprintable() -> Vec<Self> {
        IdentityDataKind::iter()
            .map(DataIdentifier::from)
            .chain(BusinessDataKind::iter().map(DataIdentifier::from))
            .filter(Self::is_fingerprintable)
            .collect()
    }
}

impl DataIdentifier {
    pub fn legacy_salt_pii_to_sign(&self, data: &PiiString) -> [u8; 32] {
        let self_name = match self {
            // For legacy fingerprints, continue to serialize IDKs without the id. prefix
            // TODO migrate legacy fingerprints
            Self::Id(idk) => idk.to_string(),
            _ => self.to_string(),
        };
        let data_clean = data.clean_for_fingerprint();
        let concat = [sha256(self_name.as_bytes()), sha256(data_clean.leak().as_bytes())].concat();
        sha256(&concat)
    }
}

impl_enum_string_diesel!(DataIdentifier);

#[cfg(test)]
mod tests {
    use super::*;
    use itertools::Itertools;
    use test_case::test_case;

    #[test_case(DataIdentifier::Id(IdentityDataKind::PhoneNumber) => "id.phone_number")]
    #[test_case(DataIdentifier::Id(IdentityDataKind::Email) => "id.email")]
    #[test_case(DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())) => "custom.flerp")]
    #[test_case(DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())) => "custom.hello.today.there.")]
    #[test_case(DataIdentifier::Business(BusinessDataKind::Tin) => "business.tin")]
    #[test_case(DataIdentifier::Business(BusinessDataKind::AddressLine2) => "business.address_line2")]
    #[test_case(DataIdentifier::Document(DocumentKind::FinraComplianceLetter) => "document.finra_compliance_letter")]
    #[test_case(DataIdentifier::Card(CardInfo{alias: AliasId::from("hayesvalley".to_string()), kind: CardDataKind::ExpMonth}) => "card.hayesvalley.exp_month")]
    fn test_to_string(identifier: DataIdentifier) -> String {
        identifier.to_string()
    }

    #[test_case("id.phone_number" => DataIdentifier::Id(IdentityDataKind::PhoneNumber))]
    #[test_case("id.email" => DataIdentifier::Id(IdentityDataKind::Email))]
    #[test_case("custom.flerp" => DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())))]
    #[test_case("custom.hello.today.there." => DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())))]
    #[test_case("custom." => DataIdentifier::Custom(KvDataKey::escape_hatch("".to_owned())))]
    #[test_case("business.tin" => DataIdentifier::Business(BusinessDataKind::Tin))]
    #[test_case("business.phone_number" => DataIdentifier::Business(BusinessDataKind::PhoneNumber))]
    #[test_case("document.finra_compliance_letter" => DataIdentifier::Document(DocumentKind::FinraComplianceLetter))]
    #[test_case("card.hayesvalley.exp_month" => DataIdentifier::Card(CardInfo{alias: AliasId::from("hayesvalley".to_string()), kind: CardDataKind::ExpMonth}))]
    fn test_from_str(input: &str) -> DataIdentifier {
        DataIdentifier::from_str(input).unwrap()
    }

    #[test]
    fn test_fingerprint() {
        // Here, we use a fixture fingerprint just compupted at some point in the past.
        // If the implementation of fingerprinting changes, the search on the dashboard will break.
        // So, if this test fails, it means you made a backwards-incompatible change to
        // fingerprinting and have to migrate old FPs

        // Test BDK
        let pii = PiiString::from("Flerp Inc");
        let fingerprint = DataIdentifier::from(BusinessDataKind::Name).legacy_salt_pii_to_sign(&pii);
        let expected_fp: [u8; 32] = [
            161, 180, 84, 228, 16, 240, 168, 166, 132, 47, 102, 90, 177, 221, 216, 47, 58, 232, 38, 0, 21,
            97, 124, 207, 95, 137, 134, 230, 44, 218, 231, 233,
        ];
        assert_eq!(fingerprint, expected_fp);

        // Test IDK
        let pii = PiiString::from("Flerp");
        let fingerprint = DataIdentifier::from(IdentityDataKind::FirstName).legacy_salt_pii_to_sign(&pii);
        let expected_fp: [u8; 32] = [
            39, 250, 148, 126, 130, 246, 176, 70, 122, 112, 252, 248, 186, 199, 185, 181, 224, 174, 161, 75,
            8, 233, 182, 46, 163, 49, 48, 54, 115, 229, 30, 135,
        ];
        assert_eq!(fingerprint, expected_fp)
    }

    #[test]
    fn test_store_plaintext() {
        // We really don't want to accidentally add a plain-text-able DI, so we have a test that
        // breaks if you add a new type.
        // Only add a new plaintext DI if you are 100% positive that this data doesn't need to be
        // encrypted
        use itertools::Itertools;

        let dis: Vec<DataIdentifier> = [
            InvestorProfileKind::iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            IdentityDataKind::iter().map(DataIdentifier::from).collect_vec(),
            BusinessDataKind::iter().map(DataIdentifier::from).collect_vec(),
            DocumentKind::iter().map(DataIdentifier::from).collect_vec(),
            vec![KvDataKey::from("hayes valley".to_owned()).into()],
        ]
        .into_iter()
        .flatten()
        .collect_vec();
        let plaintext_types = vec![DataIdentifier::Business(BusinessDataKind::Name)];
        assert!(dis
            .iter()
            .all(|di| di.store_plaintext() == plaintext_types.contains(di)));
    }

    #[test]
    #[ignore]
    fn enumerate_test() {
        let dis: Vec<DataIdentifier> = [
            InvestorProfileKind::iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            IdentityDataKind::iter().map(DataIdentifier::from).collect_vec(),
            BusinessDataKind::iter().map(DataIdentifier::from).collect_vec(),
            DocumentKind::iter().map(DataIdentifier::from).collect_vec(),
        ]
        .into_iter()
        .flatten()
        .collect_vec();

        let json = serde_json::to_string_pretty(&dis).unwrap();
        println!("{json}")
    }
}
