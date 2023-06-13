use crate::{
    BusinessDataKind as BDK, CollectedData, DataIdentifier, DocumentKind as DK, IdentityDataKind as IDK,
    InvestorProfileKind as IPK,
};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use itertools::Itertools;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use std::collections::HashSet;
use strum::IntoEnumIterator;
use strum_macros::{AsRefStr, Display, EnumString};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Hash,
    Display,
    Clone,
    DeserializeFromStr,
    SerializeDisplay,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
/// Represent the options of allowed CollectedData.
/// Some CollectedData variants only have a single allowable CollectedDataOption.
/// Other CollectedData variants may have multiple Options of assortments of data that can be collected.
/// Each CollectedDataOption maps to a list of IdentityDataKinds that are represented by the CDO
pub enum CollectedDataOption {
    Name,
    Dob,
    Ssn4,
    Ssn9,
    FullAddress,
    PartialAddress,
    Email,
    PhoneNumber,
    Nationality,

    // these correspond to Identity documents + selfie
    Document,
    DocumentAndSelfie,

    // TODO: maybe nest these
    BusinessName,
    BusinessTin,
    BusinessAddress,
    BusinessPhoneNumber,
    BusinessWebsite,
    BusinessBeneficialOwners,
    BusinessKycedBeneficialOwners,
    BusinessCorporationType,

    InvestorProfile,

    Card,
}

crate::util::impl_enum_str_diesel!(CollectedDataOption);

impl CollectedDataOption {
    pub fn parent(&self) -> CollectedData {
        match self {
            Self::Name => CollectedData::Name,
            Self::Dob => CollectedData::Dob,
            Self::Ssn4 | Self::Ssn9 => CollectedData::Ssn,
            Self::FullAddress | Self::PartialAddress => CollectedData::Address,
            Self::Email => CollectedData::Email,
            Self::PhoneNumber => CollectedData::PhoneNumber,
            Self::Nationality => CollectedData::Nationality,
            Self::Document => CollectedData::Document,
            Self::DocumentAndSelfie => CollectedData::Document,
            Self::BusinessName => CollectedData::BusinessName,
            Self::BusinessTin => CollectedData::BusinessTin,
            Self::BusinessAddress => CollectedData::BusinessAddress,
            Self::BusinessPhoneNumber => CollectedData::BusinessPhoneNumber,
            Self::BusinessWebsite => CollectedData::BusinessWebsite,
            Self::BusinessBeneficialOwners => CollectedData::BusinessBeneficialOwners,
            Self::BusinessKycedBeneficialOwners => CollectedData::BusinessBeneficialOwners,
            Self::BusinessCorporationType => CollectedData::BusinessCorporationType,
            Self::InvestorProfile => CollectedData::InvestorProfile,
            Self::Card => CollectedData::Card,
        }
    }

    /// Maps each CDO to the list of DataIdentifiers to be collected for the option
    pub fn data_identifiers(&self) -> Option<Vec<DataIdentifier>> {
        match self {
            Self::Name => Some(vec![IDK::FirstName.into(), IDK::LastName.into()]),
            Self::Dob => Some(vec![IDK::Dob.into()]),
            Self::Ssn9 => Some(vec![IDK::Ssn9.into(), IDK::Ssn4.into()]),
            Self::Ssn4 => Some(vec![IDK::Ssn4.into()]),
            Self::FullAddress => Some(vec![
                IDK::AddressLine1.into(),
                IDK::AddressLine2.into(),
                IDK::City.into(),
                IDK::State.into(),
                IDK::Zip.into(),
                IDK::Country.into(),
            ]),
            Self::PartialAddress => Some(vec![IDK::Zip.into(), IDK::Country.into()]),
            Self::Email => Some(vec![IDK::Email.into()]),
            Self::PhoneNumber => Some(vec![IDK::PhoneNumber.into()]),
            Self::Nationality => Some(vec![IDK::Nationality.into()]),
            Self::BusinessName => Some(vec![BDK::Name.into(), BDK::Dba.into()]),
            Self::BusinessTin => Some(vec![BDK::Tin.into()]),
            Self::BusinessAddress => Some(vec![
                BDK::AddressLine1.into(),
                BDK::AddressLine2.into(),
                BDK::City.into(),
                BDK::State.into(),
                BDK::Zip.into(),
                BDK::Country.into(),
            ]),
            Self::BusinessPhoneNumber => Some(vec![BDK::PhoneNumber.into()]),
            Self::BusinessWebsite => Some(vec![BDK::Website.into()]),
            Self::BusinessBeneficialOwners => Some(vec![BDK::BeneficialOwners.into()]),
            Self::BusinessKycedBeneficialOwners => Some(vec![BDK::KycedBeneficialOwners.into()]),
            Self::BusinessCorporationType => Some(vec![BDK::CorporationType.into()]),

            // Can we stick the investor profile identifier in here? Even if it's a different DI variant... cool
            Self::InvestorProfile => Some(
                IPK::iter()
                    .map(|x| x.into())
                    .chain(vec![DK::FinraComplianceLetter.into()])
                    .collect(),
            ),

            Self::Document => None,
            Self::DocumentAndSelfie => None,

            // TODO we should associate this with types of data
            Self::Card => None,
        }
    }

    /// Maps the CDO to the list of DIs that are required and are represented by the CDO, if self
    /// represents T. Otherwise, returns an empty list.
    pub fn required_data_identifiers(&self) -> Vec<DataIdentifier> {
        self.data_identifiers()
            .map(|dis| dis.into_iter().filter(|k| !k.is_optional()).collect())
            .unwrap_or_default()
    }

    /// Given a list of DataIdentifiers (maybe collected via API), computes the set of
    /// CollectedDataOptions represented by this list of DataIdentifiers
    pub fn list_from(dis: Vec<DataIdentifier>) -> HashSet<Self> {
        let dis: HashSet<_> = dis.into_iter().collect();
        // For each CollectedData variant, figure out which of the options (if any) is represented
        // in the list of dis
        CollectedData::iter()
            .flat_map(|cd| {
                let possible_options = cd.options();
                // Get the maximal option whose attributes are entirely contained in this list of dis
                // in the list of dis
                possible_options
                    .into_iter()
                    .rev()
                    .filter_map(|cdo| {
                        let dis = cdo.required_data_identifiers();
                        // Filter out CDOs with no required DIs
                        (!dis.is_empty()).then_some((cdo, dis))
                    })
                    .find(|(_, attrs)| {
                        let required_attrs: HashSet<_> = attrs.iter().cloned().collect();
                        dis.is_superset(&required_attrs)
                    })
                    .map(|(cdo, _)| cdo)
            })
            .collect()
    }

    /// Given a list of DataIdentifiers, removes the DIs that are part of a coherent CDO. Returns
    /// extra, "dangling" identifiers that are not part of any CDO.
    /// For example, id.first_name is considered dangling when provided without id.last_name
    pub fn dangling_identifiers(dis: Vec<DataIdentifier>) -> Vec<DataIdentifier> {
        let cdos = CollectedDataOption::list_from(dis.clone());
        let represented_identifiers: HashSet<_> = cdos
            .into_iter()
            .flat_map(|cdo| cdo.data_identifiers().unwrap_or_default())
            .collect();
        // Filter out the DIs that don't have a parent (like custom DIs) - these are never considered
        // dangling
        let keys: HashSet<_> = dis.into_iter().filter(|di| di.parent().is_some()).collect();
        // Keys given minus represented keys
        keys.difference(&represented_identifiers).cloned().collect_vec()
    }

    /// Maps the partial variant to a full variant of an option, if exists.
    /// Should stay in sync with CollectedData::options()
    pub fn full_variant(&self) -> Option<Self> {
        match self {
            Self::Ssn4 => Some(Self::Ssn9),
            Self::PartialAddress => Some(Self::FullAddress),
            Self::Document => Some(Self::DocumentAndSelfie),
            Self::BusinessBeneficialOwners => Some(Self::BusinessKycedBeneficialOwners),
            _ => None,
        }
    }
}
