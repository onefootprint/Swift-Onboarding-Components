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
mod derived;
mod doc_kind;
mod document_di_kind;
mod identity_data_kind;
mod investor_profile_kind;
mod kv_data_key;
mod validation;

pub use self::{
    business_data_kind::*,
    card_data_kind::*,
    collected_data::*,
    contact_info_kind::*,
    decryptable_identifier::*,
    derived::*,
    doc_kind::*,
    document_di_kind::*,
    identity_data_kind::*,
    investor_profile_kind::*,
    validation::{Error as DiValidationError, *},
};
use crate::{
    fingerprinter::GlobalFingerprintKind, util::impl_enum_string_diesel, KvDataKey, NtResult, PiiJsonValue,
    PiiString, ValidateArgs,
};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use itertools::Itertools;
use paperclip::v2::models::DataType;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::{hash::Hash, str::FromStr};
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
                DataIdentifierDiscriminant::Document => DocumentDiKind::api_examples()
                    .into_iter()
                    .map(DataIdentifier::from)
                    .collect_vec(),
                DataIdentifierDiscriminant::Card => CardInfo::api_examples()
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
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
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
    /// Returns true if the DI can be fingerprinted. Will automatically fingerprint non-document
    /// data with these types when added to the vault
    pub fn is_fingerprintable(&self) -> bool {
        Self::searchable().contains(self)
    }

    /// Returns true if the DI can be globally fingerprinted
    pub fn is_globally_fingerprintable(&self) -> bool {
        GlobalFingerprintKind::try_from(self).is_ok()
    }

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
    use crate::{AliasId, DocumentSide, IdDocKind};
    use itertools::Itertools;
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
    // Support the legacy formats
    #[test_case("document.ssn_card.front.image" => DataIdentifier::Document(DocumentDiKind::SsnCard))]
    #[test_case("document.ssn_card.front.latest_upload" => DataIdentifier::Document(DocumentDiKind::SsnCard))]
    #[test_case("document.proof_of_address.front.image" => DataIdentifier::Document(DocumentDiKind::ProofOfAddress))]
    #[test_case("document.proof_of_address.front.latest_upload" => DataIdentifier::Document(DocumentDiKind::ProofOfAddress))]
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
