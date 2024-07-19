//! This module contains all of the different ways that we identify data stored inside of a
//! UserVault.
//!
//! `DataIdentifier`: the top level identitfier of a piece of data. Given a UVW and a
//! `DataIdentifier`, we should be able to locate the underlying piece of data that is requested.
//! `DataIdentifier`s are also used in access events to designate which pieces of data were
//! decrypted.
//!
//! `CollectedData` and `CollectedDataOption` are also tangential - they are used in onboarding
//! configurations to specify the set of dentity data that needs to be collected, and in permissions
//! to represent which pieces of data are allowed to be decrypted/accessed. Each `CollectedData`
//! variant represents a kind of data that can be collected, like Name or Ssn.
//! - Some `CollectedData` variants have multiple configurations of identity data that can be
//!   collected. Those configurations are represented in `CollectedDataOption` - for example, to
//!   collected a `CD::Address`, you could either collected `CDO::PartialAddress` or
//!   `CDO::FullAddress`
//! - Some `CollectedDataOption` variants may represent multiple underlying `IdentityDataKind`s -
//!   for example, `CDO::Name` cannot be collected without collecting _both_ `IDK::FirstName` and
//!   `IDK::LastName`.

mod business_data_kind;
mod card_data_kind;
mod collected_data;
mod contact_info_kind;
mod decryptable_identifier;
mod derived;
mod doc_kind;
mod document_di_kind;
mod documentation;
mod identity_data_kind;
mod investor_profile_kind;
mod kv_data_key;
mod validation;

pub use self::business_data_kind::*;
pub use self::card_data_kind::*;
pub use self::collected_data::*;
pub use self::contact_info_kind::*;
pub use self::decryptable_identifier::*;
pub use self::derived::*;
pub use self::doc_kind::*;
pub use self::document_di_kind::*;
pub use self::documentation::*;
pub use self::identity_data_kind::*;
pub use self::investor_profile_kind::*;
pub use self::validation::Error as DiValidationError;
pub use self::validation::*;
use crate::util::impl_enum_string_diesel;
use crate::KvDataKey;
use crate::NtResult;
use crate::PiiJsonValue;
use crate::PiiString;
use crate::ValidateArgs;
use crate::VaultKind;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use itertools::Itertools;
use regex::Regex;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use std::hash::Hash;
use std::str::FromStr;
use strum_macros::EnumDiscriminants;

lazy_static! {
    // The charset of a DI must not include a '/' to be compatible with Vault Disaster Recovery,
    // which places DIs in S3 paths.
    pub static ref DATA_IDENTIFIER_CHARS: Regex = Regex::new(r"^([A-Za-z0-9\-_\.]+)$").unwrap();
}

#[derive(
    Debug,
    Eq,
    PartialEq,
    Hash,
    Clone,
    AsExpression,
    FromSqlRow,
    EnumDiscriminants,
    SerializeDisplay,
    DeserializeFromStr,
)]
#[strum_discriminants(
    name(DataIdentifierDiscriminant),
    vis(pub),
    derive(strum_macros::EnumString, strum_macros::Display, strum_macros::EnumIter),
    strum(serialize_all = "snake_case")
)]
#[diesel(sql_type = Text)]
/// Represents a piece of data stored inside the user vault.
/// Mostly used in requests to decrypt a piece of data and in access events to show the log of
/// decrypted items.
pub enum DataIdentifier {
    Id(IdentityDataKind),
    Business(BusinessDataKind),
    Custom(KvDataKey),
    InvestorProfile(InvestorProfileKind),
    Document(DocumentDiKind),
    Card(CardInfo),
}

// non_exhaustive ensures values are only constructed via CleanAndValidate.
#[non_exhaustive]
pub struct DataIdentifierValue<P = ()> {
    pub di: DataIdentifier,
    pub value: PiiString,

    /// Optional structured data representing the value. When this is set, we use it to derive
    /// other DIs
    pub parsed: P,
}

impl<T> From<DataIdentifierValue> for DataIdentifierValue<Option<T>> {
    fn from(value: DataIdentifierValue) -> Self {
        DataIdentifierValue {
            di: value.di,
            value: value.value,
            parsed: None,
        }
    }
}

impl<T> From<DataIdentifierValue<T>> for DataIdentifierValue<Option<ParsedDataIdentifier>>
where
    T: Into<ParsedDataIdentifier>,
{
    fn from(value: DataIdentifierValue<T>) -> Self {
        DataIdentifierValue {
            di: value.di,
            value: value.value,
            parsed: Some(value.parsed.into()),
        }
    }
}

/// Contains all of the functionality that each nested type of DataIdentifier must provide
pub trait IsDataIdentifierDiscriminant:
    Hash + Eq + Clone + TryFrom<DataIdentifier> + Into<DataIdentifier> + CleanAndValidate
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

    pub fn is_contact_info(&self) -> bool {
        matches!(
            self,
            Self::Id(IdentityDataKind::PhoneNumber) | Self::Id(IdentityDataKind::Email)
        )
    }

    /// does this data identifier conflict with the existence of another data identifer already
    /// present, return conflicting DIs
    pub fn conflicting_data_identifiers(&self) -> Vec<DataIdentifier> {
        match self {
            DataIdentifier::Id(id) => match *id {
                // don't allow SSN when ITIN is present
                IdentityDataKind::Itin => vec![
                    DataIdentifier::Id(IdentityDataKind::Ssn9),
                    DataIdentifier::Id(IdentityDataKind::Ssn4),
                ],
                // don't allow ITIN when SSN is present
                IdentityDataKind::Ssn4 | IdentityDataKind::Ssn9 => {
                    vec![DataIdentifier::Id(IdentityDataKind::Itin)]
                }
                _ => vec![],
            },
            DataIdentifier::Custom(_)
            | DataIdentifier::Business(_)
            | DataIdentifier::InvestorProfile(_)
            | DataIdentifier::Document(_)
            | DataIdentifier::Card(_) => vec![],
        }
    }
}

#[derive(derive_more::From)]
pub enum ParsedDataIdentifier {
    Id(Option<IdentityData>),
    Card(Option<CardData>),
}

impl CleanAndValidate for DataIdentifier {
    type Parsed = Option<ParsedDataIdentifier>;

    /// Clean and validate the value for the given DataIdentifier.
    /// Each entry's value is represented as a PiiString when saved in the vault, even if the
    /// input type was a JSON.
    fn clean_and_validate(
        self,
        value: PiiJsonValue,
        args: ValidateArgs,
        all_data: &AllData,
    ) -> NtResult<DataIdentifierValue<Self::Parsed>> {
        if value.is_string() && self.expected_json_format() {
            // TODO make this return a hard validation error at some point
            tracing::error!(di=%self, "Tried to vault data in incorrect format");
        }
        match self {
            Self::Id(s) => s.clean_and_validate(value, args, all_data).map(Into::into),
            Self::Custom(s) => s.clean_and_validate(value, args, all_data).map(Into::into),
            Self::Business(s) => s.clean_and_validate(value, args, all_data).map(Into::into),
            Self::InvestorProfile(s) => s.clean_and_validate(value, args, all_data).map(Into::into),
            Self::Document(s) => s.clean_and_validate(value, args, all_data).map(Into::into),
            Self::Card(s) => s.clean_and_validate(value, args, all_data).map(Into::into),
        }
    }
}

/// A custom implementation to make the appearance of serialized DataIdentifiers much more
/// reasonable. We serialize DIs as `prefix.suffix`
impl std::fmt::Display for DataIdentifier {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = DataIdentifierDiscriminant::from(self);
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

impl DataIdentifierDiscriminant {
    /// Returns true if the provided VaultKind is allowed to store a data identifier with this
    /// discriminant
    pub fn is_allowed_for(&self, vault_kind: VaultKind) -> bool {
        match vault_kind {
            VaultKind::Person => match self {
                Self::Id | Self::Custom | Self::InvestorProfile | Self::Document | Self::Card => true,
                Self::Business => false,
            },
            VaultKind::Business => match self {
                Self::Business | Self::Custom => true,
                Self::Id | Self::InvestorProfile | Self::Document | Self::Card => false,
            },
        }
    }
}

/// A custom implementation to make the appearance of serialized DataIdentifiers much more
/// reasonable. We serialize DIs as `prefix.suffix`
impl FromStr for DataIdentifier {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if !DATA_IDENTIFIER_CHARS.is_match(s) {
            return Err(crate::Error::CannotParseDi(s.to_owned()));
        }
        let period_idx = s
            .find('.')
            .ok_or_else(|| crate::Error::CannotParseDi(s.to_owned()))?;
        let prefix = &s[..period_idx];
        let suffix = &s[(period_idx + 1)..];
        let prefix = DataIdentifierDiscriminant::from_str(prefix)
            .map_err(|_| crate::Error::CannotParseDi(s.to_owned()))?;
        let cannot_parse_err = crate::Error::CannotParseDi(s.to_owned());
        // Parse the suffix differently depending on the prefix
        let result = match prefix {
            DataIdentifierDiscriminant::Id => {
                Self::Id(IdentityDataKind::from_str(suffix).map_err(|_| cannot_parse_err)?)
            }
            DataIdentifierDiscriminant::Custom => {
                Self::Custom(KvDataKey::from_str(suffix).map_err(|_| cannot_parse_err)?)
            }
            DataIdentifierDiscriminant::Business => {
                Self::Business(BusinessDataKind::from_str(suffix).map_err(|_| cannot_parse_err)?)
            }
            DataIdentifierDiscriminant::InvestorProfile => {
                Self::InvestorProfile(InvestorProfileKind::from_str(suffix).map_err(|_| cannot_parse_err)?)
            }
            DataIdentifierDiscriminant::Document => {
                Self::Document(DocumentDiKind::from_str(suffix).map_err(|_| cannot_parse_err)?)
            }
            DataIdentifierDiscriminant::Card => {
                Self::Card(CardInfo::from_str(suffix).map_err(|_| cannot_parse_err)?)
            }
        };
        Ok(result)
    }
}

impl DataIdentifier {
    /// collect fingerprintable DIs
    pub fn searchable() -> Vec<Self> {
        vec![
            IdentityDataKind::searchable()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            BusinessDataKind::searchable()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            DocumentDiKind::searchable()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
        ]
        .into_iter()
        .flatten()
        .collect()
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

    /// Returns true if the DI is expected to be stored in JSON
    pub fn expected_json_format(&self) -> bool {
        matches!(
            self,
            DataIdentifier::Id(IdentityDataKind::Citizenships)
                | DataIdentifier::Business(BusinessDataKind::BeneficialOwners)
                | DataIdentifier::Business(BusinessDataKind::KycedBeneficialOwners)
                | DataIdentifier::InvestorProfile(InvestorProfileKind::InvestmentGoals)
                | DataIdentifier::InvestorProfile(InvestorProfileKind::Declarations)
                | DataIdentifier::InvestorProfile(InvestorProfileKind::SeniorExecutiveSymbols)
                | DataIdentifier::InvestorProfile(InvestorProfileKind::FamilyMemberNames)
        )
    }
}

impl_enum_string_diesel!(DataIdentifier);

#[cfg(test)]
mod tests {
    use super::*;
    use crate::AliasId;
    use crate::DocumentSide;
    use crate::IdDocKind;
    use itertools::Itertools;
    use strum::IntoEnumIterator;
    use test_case::test_case;

    #[test_case(DataIdentifier::Id(IdentityDataKind::PhoneNumber) => "id.phone_number")]
    #[test_case(DataIdentifier::Id(IdentityDataKind::Email) => "id.email")]
    #[test_case(DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())) => "custom.flerp")]
    #[test_case(DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())) => "custom.hello.today.there.")]
    #[test_case(DataIdentifier::Business(BusinessDataKind::Tin) => "business.tin")]
    #[test_case(DataIdentifier::Business(BusinessDataKind::AddressLine2) => "business.address_line2")]
    #[test_case(DataIdentifier::Document(DocumentDiKind::Image(IdDocKind::DriversLicense, DocumentSide::Front)) => "document.drivers_license.front.image")]
    #[test_case(DataIdentifier::Document(DocumentDiKind::MimeType(IdDocKind::DriversLicense, DocumentSide::Front)) => "document.drivers_license.front.mime_type")]
    #[test_case(DataIdentifier::Document(DocumentDiKind::LatestUpload(IdDocKind::DriversLicense, DocumentSide::Front)) => "document.drivers_license.front.latest_upload")]
    #[test_case(DataIdentifier::Document(DocumentDiKind::FinraComplianceLetter) => "document.finra_compliance_letter")]
    #[test_case(DataIdentifier::Card(CardInfo{alias: AliasId::from("hayesvalley".to_string()), kind: CardDataKind::ExpMonth}) => "card.hayesvalley.expiration_month")]
    #[test_case(DataIdentifier::Document(DocumentDiKind::OcrData(IdDocKind::DriversLicense, OcrDataKind::DocumentNumber)) => "document.drivers_license.document_number")]
    #[test_case(DataIdentifier::Document(DocumentDiKind::SsnCard) => "document.ssn_card.image")]
    #[test_case(DataIdentifier::Document(DocumentDiKind::ProofOfAddress) => "document.proof_of_address.image")]
    fn test_to_string(identifier: DataIdentifier) -> String {
        identifier.to_string()
    }

    #[test_case("id.phone_number" => DataIdentifier::Id(IdentityDataKind::PhoneNumber))]
    #[test_case("id.email" => DataIdentifier::Id(IdentityDataKind::Email))]
    #[test_case("custom.flerp" => DataIdentifier::Custom(KvDataKey::escape_hatch("flerp".to_owned())))]
    #[test_case("custom.hello.today.there." => DataIdentifier::Custom(KvDataKey::escape_hatch("hello.today.there.".to_owned())))]
    #[test_case("business.tin" => DataIdentifier::Business(BusinessDataKind::Tin))]
    #[test_case("business.phone_number" => DataIdentifier::Business(BusinessDataKind::PhoneNumber))]
    #[test_case("document.drivers_license.front.image" => DataIdentifier::Document(DocumentDiKind::Image(IdDocKind::DriversLicense, DocumentSide::Front)))]
    #[test_case("document.drivers_license.front.mime_type" => DataIdentifier::Document(DocumentDiKind::MimeType(IdDocKind::DriversLicense, DocumentSide::Front)))]
    #[test_case("document.drivers_license.front.latest_upload" => DataIdentifier::Document(DocumentDiKind::LatestUpload(IdDocKind::DriversLicense, DocumentSide::Front)))]
    #[test_case("document.finra_compliance_letter" => DataIdentifier::Document(DocumentDiKind::FinraComplianceLetter))]
    #[test_case("card.hayesvalley.expiration_month" => DataIdentifier::Card(CardInfo{alias: AliasId::from("hayesvalley".to_string()), kind: CardDataKind::ExpMonth}))]
    #[test_case("document.passport.document_number" => DataIdentifier::Document(DocumentDiKind::OcrData(IdDocKind::Passport, OcrDataKind::DocumentNumber)))]
    #[test_case("document.ssn_card.image" => DataIdentifier::Document(DocumentDiKind::SsnCard))]
    #[test_case("document.proof_of_address.image" => DataIdentifier::Document(DocumentDiKind::ProofOfAddress))]
    fn test_from_str(input: &str) -> DataIdentifier {
        DataIdentifier::from_str(input).unwrap()
    }

    #[test_case("custom.a+b")]
    #[test_case("custom.c/d")]
    #[test_case("a/b.c")]
    #[test_case("d+e.f")]
    #[test_case("document+.proof_of_address.front.image")]
    #[test_case("document.proof_of_address.front.latest_upload/")]
    fn test_invalid(input: &str) {
        assert!(DataIdentifier::from_str(input).is_err());
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
            CardInfo::api_examples()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            DocumentDiKind::api_examples()
                .into_iter()
                .map(DataIdentifier::from)
                .collect_vec(),
            vec![DataIdentifier::Custom(KvDataKey::from("hayesvalley".to_owned()))],
        ]
        .into_iter()
        .flatten()
        .collect_vec();
        let plaintext_types = [
            DataIdentifier::Business(BusinessDataKind::Name),
            DataIdentifier::Card(CardInfo {
                alias: AliasId::fixture(),
                kind: CardDataKind::Issuer,
            }),
        ];
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
            DocumentDiKind::api_examples()
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
