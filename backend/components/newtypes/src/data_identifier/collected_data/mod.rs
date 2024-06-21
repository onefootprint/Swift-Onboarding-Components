use crate::DataIdentifierDiscriminant;
use strum::EnumIter;
use strum_macros::Display;

#[derive(Debug, Eq, PartialEq, Ord, PartialOrd, Hash, Display, Clone, Copy, EnumIter)]
/// Represents a type of collectible data. Each variant represents a set of fields that must be
/// collected together, like FirstName and LastName.
/// Some CollectedData variants have multiple Options of allowable collectible fields. For example,
/// Address can be populated by providing either a PartialAddress or a FullAddress
pub enum CollectedData {
    Name,
    Dob,
    Ssn,
    Address,
    Email,
    PhoneNumber,
    Document,

    // TODO: maybe nest these
    BusinessName,
    BusinessTin,
    BusinessAddress,
    BusinessPhoneNumber,
    BusinessWebsite,
    BusinessBeneficialOwners,
    BusinessCorporationType,

    InvestorProfile,
    Card,

    UsLegalStatus,
    /// Deprecated for new playbooks, but we have a few legacy playbooks using this in prod
    Nationality,

    UsTaxId,
}

impl CollectedData {
    /// Returns all the variants of this CollectedDataOption, in increasing order of "completeness."
    pub fn options(&self) -> Vec<CollectedDataOption> {
        use CollectedDataOption::*;
        // NOTE: these CDOs with multiple options MUST be returned in increasing order of
        // "completeness" - the options that contain fewer fields are first
        // TODO we're probably outgrowing this
        match self {
            Self::Name => vec![Name],
            Self::Dob => vec![Dob],
            Self::Email => vec![Email],
            Self::PhoneNumber => vec![PhoneNumber],
            Self::Ssn => vec![Ssn4, Ssn9],
            Self::Address => vec![FullAddress],
            Self::BusinessName => vec![BusinessName],
            Self::BusinessTin => vec![BusinessTin],
            Self::BusinessAddress => vec![BusinessAddress],
            Self::BusinessPhoneNumber => vec![BusinessPhoneNumber],
            Self::BusinessWebsite => vec![BusinessWebsite],
            Self::BusinessBeneficialOwners => vec![BusinessBeneficialOwners, BusinessKycedBeneficialOwners],
            Self::BusinessCorporationType => vec![BusinessCorporationType],
            Self::InvestorProfile => vec![InvestorProfile],
            Self::Card => vec![Card],
            // TODO it would be great if we didn't have to specify this here. could likely wipe this list
            Self::Document => vec![],
            Self::UsLegalStatus => vec![UsLegalStatus],
            Self::Nationality => vec![Nationality],
            Self::UsTaxId => vec![UsTaxId],
        }
    }

    pub fn data_identifier_kind(&self) -> DataIdentifierDiscriminant {
        match self {
            Self::BusinessName
            | Self::BusinessTin
            | Self::BusinessAddress
            | Self::BusinessPhoneNumber
            | Self::BusinessWebsite
            | Self::BusinessBeneficialOwners
            | Self::BusinessCorporationType => DataIdentifierDiscriminant::Business,
            Self::Name
            | Self::Dob
            | Self::Ssn
            | Self::Address
            | Self::Email
            | Self::PhoneNumber
            | Self::Nationality
            | Self::UsLegalStatus
            | Self::UsTaxId => DataIdentifierDiscriminant::Id,
            Self::Document => DataIdentifierDiscriminant::Document,
            Self::InvestorProfile => DataIdentifierDiscriminant::InvestorProfile,
            Self::Card => DataIdentifierDiscriminant::Card,
        }
    }
}

mod document;
mod options;
pub use document::*;
pub use options::*;

#[cfg(test)]
mod test;
