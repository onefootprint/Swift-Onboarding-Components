//! This module contains all of the different ways that we identify data stored inside of a UserVault.
//!
//! `DataIdentifier`: the top level identitfier of a piece of data. Given a UVW and a `DataIdentifier`,
//! we should be able to locate the underlying piece of data that is requested. `DataIdentifier`s are
//! also used in access events to designate which pieces of data were decrypted.
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
mod card_data_kind;
mod collected_data;
mod contact_info_kind;
mod decryptable_identifier;
mod document_kind;
mod id_doc_kind;
mod identity_data_kind;
mod investor_profile_kind;
mod kv_data_key;
mod validation;

pub use self::{
    business_data_kind::*, card_data_kind::*, collected_data::*, contact_info_kind::*,
    decryptable_identifier::*, document_kind::*, id_doc_kind::*, identity_data_kind::*,
    investor_profile_kind::*, validation::Error as ValidationError, validation::*,
};
use crate::{
    util::impl_enum_string_diesel, AliasId, EnumDotNotationError, KvDataKey, NtResult, PiiJsonValue,
    PiiString, ValidateArgs, VaultKind,
};
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
    /// Maps the DI variant to the CollectedData variant that contains this DI
    fn parent(&self) -> Option<CollectedData>;
}

impl DataIdentifier {
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
        matches!(
            self,
            Self::Business(BusinessDataKind::Name)
                | Self::Card(CardInfo {
                    alias: _,
                    kind: CardDataKind::Issuer
                })
        )
    }

    pub fn globally_unique(&self) -> bool {
        matches!(self, Self::Id(IdentityDataKind::PhoneNumber))
    }
}

impl Validate for DataIdentifier {
    /// Validate the value for the given DataIdentifier.
    /// Returns an Ok result with all of entries to be vaulted (including derived entries).
    /// Each entry's value is represented as a PiiString when saved in the vault, even if the
    /// input type was a JSON.
    fn validate(
        self,
        value: PiiJsonValue,
        args: ValidateArgs,
        all_data: &AllData,
    ) -> NtResult<Vec<(DataIdentifier, PiiString)>> {
        match self {
            Self::Id(s) => s.validate(value, args, all_data),
            Self::Custom(s) => s.validate(value, args, all_data),
            Self::Business(s) => s.validate(value, args, all_data),
            Self::InvestorProfile(s) => s.validate(value, args, all_data),
            Self::Document(s) => s.validate(value, args, all_data),
            Self::Card(s) => s.validate(value, args, all_data),
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
                DataIdentifierDiscriminant::Document => DocumentKind::api_examples()
                    .into_iter()
                    .map(DataIdentifier::from)
                    .collect_vec(),
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
        Self::fingerprintable().contains(self)
    }

    /// collect fingerprintable DIs
    pub fn fingerprintable() -> Vec<Self> {
        vec![
            IdentityDataKind::searchable()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            BusinessDataKind::searchable()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            DocumentKind::searchable()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
        ]
        .into_iter()
        .flatten()
        .collect()
    }

    /// Returns true if the DI is allowed to be inserted into the specified vault kind
    pub fn is_allowed_for(&self, vault_kind: VaultKind) -> bool {
        // Keep full match statements here so we have to implement this any time there's a new
        // VaultKind or DataIdentifierDiscriminant
        match vault_kind {
            VaultKind::Person => match self {
                Self::Id(_)
                | Self::Custom(_)
                | Self::InvestorProfile(_)
                | Self::Document(_)
                | Self::Card(_) => true,
                Self::Business(_) => false,
            },
            VaultKind::Business => match self {
                Self::Business(_) | Self::Custom(_) => true,
                Self::Id(_) | Self::InvestorProfile(_) | Self::Document(_) | Self::Card(_) => false,
            },
        }
    }
}

/// Defines variants for how encrypted bytes are actually stored
/// TODO update this?
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum StorageType {
    /// in the database as 'vault_data'
    VaultData,
    /// larger data stored in the `document_data` table with content bytes `s3`
    DocumentData,
    /// stored in the `document_data` table alongside the document itself
    DocumentMetadata,
}

impl DataIdentifier {
    /// defines how the encrypted bytes of the data identifier is stored
    pub fn storage_type(&self) -> StorageType {
        match self {
            DataIdentifier::Document(doc_kind) => doc_kind.storage_type(),
            DataIdentifier::InvestorProfile(_)
            | DataIdentifier::Business(_)
            | DataIdentifier::Id(_)
            // Custom data won't always be VaultData anymore - will sometimes be document
            | DataIdentifier::Custom(_)
            | DataIdentifier::Card(_) => StorageType::VaultData,
        }
    }
}

impl_enum_string_diesel!(DataIdentifier);

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{DocumentSide, IdDocKind};
    use itertools::Itertools;
    use test_case::test_case;

    #[test_case(DataIdentifier::Id(IdentityDataKind::PhoneNumber) => "id.phone_number")]
    #[test_case(DataIdentifier::Id(IdentityDataKind::Email) => "id.email")]
    #[test_case(DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())) => "custom.flerp")]
    #[test_case(DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())) => "custom.hello.today.there.")]
    #[test_case(DataIdentifier::Business(BusinessDataKind::Tin) => "business.tin")]
    #[test_case(DataIdentifier::Business(BusinessDataKind::AddressLine2) => "business.address_line2")]
    #[test_case(DataIdentifier::Document(DocumentKind::Image(IdDocKind::DriversLicense, DocumentSide::Front)) => "document.drivers_license.front.image")]
    #[test_case(DataIdentifier::Document(DocumentKind::MimeType(IdDocKind::DriversLicense, DocumentSide::Front)) => "document.drivers_license.front.mime_type")]
    #[test_case(DataIdentifier::Document(DocumentKind::LatestUpload(IdDocKind::DriversLicense, DocumentSide::Front)) => "document.drivers_license.front.latest_upload")]
    #[test_case(DataIdentifier::Document(DocumentKind::FinraComplianceLetter) => "document.finra_compliance_letter")]
    #[test_case(DataIdentifier::Card(CardInfo{alias: AliasId::from("hayesvalley".to_string()), kind: CardDataKind::ExpMonth}) => "card.hayesvalley.expiration_month")]
    #[test_case(DataIdentifier::Document(DocumentKind::OcrData(IdDocKind::DriversLicense, OcrDataKind::DocumentNumber)) => "document.drivers_license.document_number")]
    fn test_to_string(identifier: DataIdentifier) -> String {
        identifier.to_string()
    }

    #[test_case("id.phone_number" => DataIdentifier::Id(IdentityDataKind::PhoneNumber))]
    #[test_case("id.email" => DataIdentifier::Id(IdentityDataKind::Email))]
    #[test_case("custom.flerp" => DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())))]
    #[test_case("custom.hello.today.there." => DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())))]
    #[test_case("business.tin" => DataIdentifier::Business(BusinessDataKind::Tin))]
    #[test_case("business.phone_number" => DataIdentifier::Business(BusinessDataKind::PhoneNumber))]
    #[test_case("document.drivers_license.front.image" => DataIdentifier::Document(DocumentKind::Image(IdDocKind::DriversLicense, DocumentSide::Front)))]
    #[test_case("document.drivers_license.front.mime_type" => DataIdentifier::Document(DocumentKind::MimeType(IdDocKind::DriversLicense, DocumentSide::Front)))]
    #[test_case("document.drivers_license.front.latest_upload" => DataIdentifier::Document(DocumentKind::LatestUpload(IdDocKind::DriversLicense, DocumentSide::Front)))]
    #[test_case("document.finra_compliance_letter" => DataIdentifier::Document(DocumentKind::FinraComplianceLetter))]
    #[test_case("card.hayesvalley.expiration_month" => DataIdentifier::Card(CardInfo{alias: AliasId::from("hayesvalley".to_string()), kind: CardDataKind::ExpMonth}))]
    #[test_case("document.passport.document_number" => DataIdentifier::Document(DocumentKind::OcrData(IdDocKind::Passport, OcrDataKind::DocumentNumber)))]
    fn test_from_str(input: &str) -> DataIdentifier {
        DataIdentifier::from_str(input).unwrap()
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
            DocumentKind::api_examples()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
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
            DocumentKind::api_examples()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
        ]
        .into_iter()
        .flatten()
        .collect_vec();

        let json = serde_json::to_string_pretty(&dis).unwrap();
        println!("{json}")
    }
}
