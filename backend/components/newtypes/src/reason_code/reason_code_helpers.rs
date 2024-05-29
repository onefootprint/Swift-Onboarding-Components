use crate::{
    FootprintReasonCode,
    MatchLevel,
};
use itertools::Itertools;
use strum::IntoEnumIterator;

#[derive(PartialEq, Eq, strum::EnumIter)]
pub(crate) enum NameAttribute {
    First,
    Last,
}

impl NameAttribute {
    fn codes(self, match_level: MatchLevel) -> Vec<FootprintReasonCode> {
        match (self, match_level) {
            (NameAttribute::First, MatchLevel::NoMatch) => {
                vec![FootprintReasonCode::NameFirstDoesNotMatch]
            }
            (NameAttribute::First, MatchLevel::CouldNotMatch) => {
                vec![FootprintReasonCode::NameFirstDoesNotMatch]
            }
            (NameAttribute::First, MatchLevel::Partial) => {
                vec![FootprintReasonCode::NameFirstPartiallyMatches]
            }
            (NameAttribute::First, MatchLevel::Exact) => vec![FootprintReasonCode::NameFirstMatches],
            (NameAttribute::Last, MatchLevel::NoMatch) => {
                vec![FootprintReasonCode::NameLastDoesNotMatch]
            }
            (NameAttribute::Last, MatchLevel::CouldNotMatch) => {
                vec![FootprintReasonCode::NameLastDoesNotMatch]
            }
            (NameAttribute::Last, MatchLevel::Partial) => {
                vec![FootprintReasonCode::NameLastPartiallyMatches]
            }
            (NameAttribute::Last, MatchLevel::Exact) => vec![FootprintReasonCode::NameLastMatches],
            _ => vec![],
        }
    }
}

pub(crate) enum NameGrouping {
    FirstAndLast((MatchLevel, MatchLevel)),
    FullName(MatchLevel),
    FullNameSimple(MatchLevel),
}
impl NameGrouping {
    fn codes(self) -> Vec<FootprintReasonCode> {
        match self {
            NameGrouping::FirstAndLast((fn_ml, ln_ml)) => {
                let first = NameAttribute::First.codes(fn_ml).into_iter();
                let last = NameAttribute::Last.codes(ln_ml).into_iter();

                // If both match, we infer the main reason code from one of them
                let overall_frc = if fn_ml == ln_ml {
                    match fn_ml {
                        MatchLevel::NoMatch => vec![FootprintReasonCode::NameDoesNotMatch],
                        MatchLevel::Partial => vec![FootprintReasonCode::NamePartiallyMatches],
                        MatchLevel::Exact => vec![FootprintReasonCode::NameMatches],
                        _ => vec![],
                    }
                } else {
                    // they are both different, so no matter what it's partial
                    vec![FootprintReasonCode::NamePartiallyMatches]
                };

                first.chain(last).chain(overall_frc).collect()
            }
            NameGrouping::FullName(ml) => Self::FirstAndLast((ml, ml)).codes(),
            NameGrouping::FullNameSimple(ml) => match ml {
                MatchLevel::NoMatch => vec![FootprintReasonCode::NameDoesNotMatch],
                MatchLevel::Partial => vec![FootprintReasonCode::NamePartiallyMatches],
                MatchLevel::Exact => vec![FootprintReasonCode::NameMatches],
                _ => vec![],
            },
        }
    }

    #[allow(unused)]
    fn phone_codes(self) -> Vec<FootprintReasonCode> {
        match self {
            NameGrouping::FullNameSimple(ml) => match ml {
                MatchLevel::NoMatch => vec![FootprintReasonCode::PhoneLocatedNameDoesNotMatch],
                MatchLevel::Partial => vec![FootprintReasonCode::PhoneLocatedNamePartiallyMatches],
                MatchLevel::Exact => vec![FootprintReasonCode::PhoneLocatedNameMatches],
                _ => vec![],
            },
            _ => vec![],
        }
    }
}

#[derive(strum::EnumIter, PartialEq, Eq, Clone)]
pub(crate) enum AddressAttribute {
    StreetName,
    StreetNumber,
    City,
    State,
    Zip,
}

impl AddressAttribute {
    fn codes(self, match_level: MatchLevel) -> Vec<FootprintReasonCode> {
        match (self, match_level) {
            (AddressAttribute::StreetName, MatchLevel::NoMatch) => {
                vec![FootprintReasonCode::AddressStreetNameDoesNotMatch]
            }
            (AddressAttribute::StreetName, MatchLevel::CouldNotMatch) => {
                vec![FootprintReasonCode::AddressStreetNameDoesNotMatch]
            }
            (AddressAttribute::StreetName, MatchLevel::Partial) => {
                vec![FootprintReasonCode::AddressStreetNamePartiallyMatches]
            }
            (AddressAttribute::StreetName, MatchLevel::Exact) => {
                vec![FootprintReasonCode::AddressStreetNameMatches]
            }
            (AddressAttribute::StreetNumber, MatchLevel::NoMatch) => {
                vec![FootprintReasonCode::AddressStreetNumberDoesNotMatch]
            }
            (AddressAttribute::StreetNumber, MatchLevel::CouldNotMatch) => {
                vec![FootprintReasonCode::AddressStreetNumberDoesNotMatch]
            }
            (AddressAttribute::StreetNumber, MatchLevel::Exact) => {
                vec![FootprintReasonCode::AddressStreetNumberMatches]
            }
            (AddressAttribute::City, MatchLevel::NoMatch) => {
                vec![FootprintReasonCode::AddressCityDoesNotMatch]
            }
            (AddressAttribute::City, MatchLevel::CouldNotMatch) => {
                vec![FootprintReasonCode::AddressCityDoesNotMatch]
            }
            (AddressAttribute::City, MatchLevel::Exact) => vec![FootprintReasonCode::AddressCityMatches],
            (AddressAttribute::State, MatchLevel::NoMatch) => {
                vec![FootprintReasonCode::AddressStateDoesNotMatch]
            }
            (AddressAttribute::State, MatchLevel::CouldNotMatch) => {
                vec![FootprintReasonCode::AddressStateDoesNotMatch]
            }
            (AddressAttribute::State, MatchLevel::Exact) => vec![FootprintReasonCode::AddressStateMatches],
            (AddressAttribute::Zip, MatchLevel::NoMatch) => {
                vec![FootprintReasonCode::AddressZipCodeDoesNotMatch]
            }
            (AddressAttribute::Zip, MatchLevel::CouldNotMatch) => {
                vec![FootprintReasonCode::AddressZipCodeDoesNotMatch]
            }
            (AddressAttribute::Zip, MatchLevel::Exact) => vec![FootprintReasonCode::AddressZipCodeMatches],
            _ => vec![],
        }
    }
}

pub(crate) enum AddressGrouping {
    SingleAddress((AddressAttribute, MatchLevel)),
    FullAddress(MatchLevel),
    AddressExactExcept(Vec<(AddressAttribute, MatchLevel)>),
    FullAddressSimple(MatchLevel),
}

impl AddressGrouping {
    fn codes(self) -> Vec<FootprintReasonCode> {
        match self {
            AddressGrouping::SingleAddress((a, ml)) => a.codes(ml),
            AddressGrouping::FullAddress(ml) => {
                let codes: Vec<FootprintReasonCode> = AddressAttribute::iter()
                    .flat_map(|a| Self::SingleAddress((a, ml)).codes())
                    .collect();

                let overall = match ml {
                    MatchLevel::NoMatch => vec![FootprintReasonCode::AddressDoesNotMatch],
                    MatchLevel::Partial => vec![FootprintReasonCode::AddressPartiallyMatches],
                    MatchLevel::Exact => vec![FootprintReasonCode::AddressMatches],
                    _ => vec![],
                };

                codes.into_iter().chain(overall).collect()
            }
            AddressGrouping::AddressExactExcept(e) => {
                let except_attributes: Vec<AddressAttribute> = e.iter().map(|(a, _)| a).cloned().collect();
                let except_codes = e
                    .into_iter()
                    .flat_map(|(a, ml)| Self::SingleAddress((a, ml)).codes());

                let rest_codes = AddressAttribute::iter().flat_map(|a| {
                    if except_attributes.contains(&a) {
                        vec![]
                    } else {
                        Self::SingleAddress((a, MatchLevel::Exact)).codes()
                    }
                });
                except_codes
                    .chain(rest_codes)
                    // this is always partial for overall address
                    .chain(vec![FootprintReasonCode::AddressPartiallyMatches])
                    .collect()
            }

            // For SSN reason codes, we don't expect codes to be broken down by individual address attributes
            AddressGrouping::FullAddressSimple(ml) => match ml {
                MatchLevel::NoMatch => vec![FootprintReasonCode::AddressDoesNotMatch],
                MatchLevel::Partial => vec![FootprintReasonCode::AddressPartiallyMatches],
                MatchLevel::Exact => vec![FootprintReasonCode::AddressMatches],
                _ => vec![],
            },
        }
    }

    #[allow(unused)]
    fn phone_codes(self) -> Vec<FootprintReasonCode> {
        match self {
            AddressGrouping::FullAddressSimple(ml) => match ml {
                MatchLevel::NoMatch => vec![FootprintReasonCode::PhoneLocatedAddressDoesNotMatch],
                MatchLevel::Partial => vec![FootprintReasonCode::PhoneLocatedAddressPartiallyMatches],
                MatchLevel::Exact => vec![FootprintReasonCode::PhoneLocatedAddressMatches],
                _ => vec![],
            },
            _ => vec![],
        }
    }
}

pub enum SsnTypes {
    // there are no partial cases for this
    Ssn4ExactMatch,
    Ssn9(MatchLevel),
    Ssn9PartialMatchSubjectDeceased,
    Ssn9ExactMatchSubjectDeceased,
    SsnIsItin,
    SsnInvalid,
}
impl SsnTypes {
    fn codes(self) -> Vec<FootprintReasonCode> {
        match self {
            SsnTypes::Ssn4ExactMatch => vec![FootprintReasonCode::SsnMatches],
            SsnTypes::Ssn9PartialMatchSubjectDeceased => vec![
                FootprintReasonCode::SsnPartiallyMatches,
                FootprintReasonCode::SubjectDeceased,
            ],
            SsnTypes::Ssn9ExactMatchSubjectDeceased => vec![
                FootprintReasonCode::SsnMatches,
                FootprintReasonCode::SubjectDeceased,
            ],
            SsnTypes::Ssn9(ml) => match ml {
                MatchLevel::NoMatch => vec![FootprintReasonCode::SsnDoesNotMatch],
                MatchLevel::Partial => vec![FootprintReasonCode::SsnPartiallyMatches],
                MatchLevel::Exact => vec![FootprintReasonCode::SsnMatches],
                _ => vec![],
            },
            SsnTypes::SsnIsItin => vec![FootprintReasonCode::SsnInputIsItin],
            SsnTypes::SsnInvalid => vec![FootprintReasonCode::SsnInputIsInvalid],
        }
    }
}

/// Helper for constructing Address and Name reason codes for internal use only!
///
/// Note: name is shortened to make constructing take up less line space
pub(crate) struct AddressRCH {
    name: NameGrouping,
    address: AddressGrouping,
}
impl AddressRCH {
    pub fn new(name: NameGrouping, address: AddressGrouping) -> Self {
        Self { name, address }
    }
}

impl From<AddressRCH> for Vec<FootprintReasonCode> {
    fn from(erch: AddressRCH) -> Self {
        let name_codes = erch.name.codes().into_iter();
        let address_codes = erch.address.codes().into_iter();

        name_codes.chain(address_codes).unique().collect()
    }
}

pub(crate) struct SsnRCH {
    ssn: SsnTypes,
    name: NameGrouping,
    address: AddressGrouping,
}
impl SsnRCH {
    pub fn new(ssn: SsnTypes, name: NameGrouping, address: AddressGrouping) -> Self {
        Self { ssn, name, address }
    }
}

impl From<SsnRCH> for Vec<FootprintReasonCode> {
    fn from(erch: SsnRCH) -> Self {
        let ssn_codes = erch.ssn.codes().into_iter();
        let name_codes = erch.name.codes().into_iter();
        let address_codes = erch.address.codes().into_iter();

        name_codes
            .chain(address_codes)
            .chain(ssn_codes)
            .unique()
            .collect()
    }
}

pub struct LexisNAS {
    // Lexis match designations are just yes or no boolean's
    pub ssn_match: bool,
    pub first_name_match: bool,
    pub last_name_match: bool,
    pub address_match: bool,
}
impl LexisNAS {
    pub fn new(ssn_match: bool, first_name_match: bool, last_name_match: bool, address_match: bool) -> Self {
        Self {
            ssn_match,
            first_name_match,
            last_name_match,
            address_match,
        }
    }
}

pub struct LexisNAP {
    // Lexis match designations are just yes or no boolean's
    pub phone_match: bool,
    pub first_name_match: bool,
    pub last_name_match: bool,
    pub address_match: bool,
}
impl LexisNAP {
    pub fn new(
        phone_match: bool,
        first_name_match: bool,
        last_name_match: bool,
        address_match: bool,
    ) -> Self {
        Self {
            phone_match,
            first_name_match,
            last_name_match,
            address_match,
        }
    }
}

pub(crate) struct PhRCH {
    pub phone_match_level: MatchLevel,
    #[allow(unused)]
    name: NameGrouping,
    #[allow(unused)]
    address: AddressGrouping,
}
impl PhRCH {
    pub fn new(phone_match_level: MatchLevel, name: NameGrouping, address: AddressGrouping) -> Self {
        Self {
            phone_match_level,
            name,
            address,
        }
    }
}

impl From<PhRCH> for Vec<FootprintReasonCode> {
    fn from(erch: PhRCH) -> Self {
        // TODO: we don't know exactly how this interplays with existing reason codes, so we
        // will just show the phone code only for now
        // let name_codes = erch.name.phone_codes().into_iter();
        // let address_codes = erch.address.phone_codes().into_iter();

        // TODO: this seems like it might be overly liberal, in that you can have just First name matching
        // Phone (and not last name, address matching) and we call this PhoneLocatedMatches
        // might make sense for us to only say phone matches if the name + address components match to a
        // reasonable level as well? or use PhoneLocatedPartiallyMatches here (and have this have a
        // dual meaning- either a digit is off in the phone itself or name/address don't match well)
        match erch.phone_match_level {
            MatchLevel::NoMatch => vec![FootprintReasonCode::PhoneLocatedDoesNotMatch],
            MatchLevel::Partial => vec![FootprintReasonCode::PhoneLocatedPartiallyMatches],
            MatchLevel::Exact => vec![FootprintReasonCode::PhoneLocatedMatches],
            _ => vec![],
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;
    use FootprintReasonCode::*;

    #[test_case(NameGrouping::FirstAndLast((MatchLevel::Exact, MatchLevel::Exact)) => vec![NameFirstMatches, NameLastMatches, NameMatches])]
    #[test_case(NameGrouping::FirstAndLast((MatchLevel::Exact, MatchLevel::NoMatch)) => vec![NameFirstMatches, NameLastDoesNotMatch, NamePartiallyMatches])]
    #[test_case(NameGrouping::FirstAndLast((MatchLevel::Exact, MatchLevel::CouldNotMatch)) => vec![NameFirstMatches, NameLastDoesNotMatch, NamePartiallyMatches])]
    #[test_case(NameGrouping::FirstAndLast((MatchLevel::NoMatch, MatchLevel::Exact)) => vec![NameFirstDoesNotMatch, NameLastMatches, NamePartiallyMatches])]
    #[test_case(NameGrouping::FirstAndLast((MatchLevel::CouldNotMatch, MatchLevel::Exact)) => vec![NameFirstDoesNotMatch, NameLastMatches, NamePartiallyMatches])]
    #[test_case(NameGrouping::FullName(MatchLevel::Exact) => vec![NameFirstMatches, NameLastMatches, NameMatches])]
    #[test_case(NameGrouping::FullName(MatchLevel::NoMatch) => vec![NameFirstDoesNotMatch, NameLastDoesNotMatch, NameDoesNotMatch])]
    #[test_case(NameGrouping::FullName(MatchLevel::Partial) => vec![NameFirstPartiallyMatches, NameLastPartiallyMatches, NamePartiallyMatches])]
    // don't apply to name
    #[test_case(NameGrouping::FullName(MatchLevel::Verified) => Vec::<FootprintReasonCode>::new())]
    #[test_case(NameGrouping::FullName(MatchLevel::NotVerified) => Vec::<FootprintReasonCode>::new())]
    #[test_case(NameGrouping::FullName(MatchLevel::CouldNotMatch) => vec![NameFirstDoesNotMatch, NameLastDoesNotMatch])]
    #[test_case(NameGrouping::FullNameSimple(MatchLevel::Exact) => vec![NameMatches])]
    #[test_case(NameGrouping::FullNameSimple(MatchLevel::NoMatch) => vec![NameDoesNotMatch])]
    #[test_case(NameGrouping::FullNameSimple(MatchLevel::Partial) => vec![NamePartiallyMatches])]

    fn test_name(name_grouping: NameGrouping) -> Vec<FootprintReasonCode> {
        name_grouping.codes()
    }

    #[test_case(NameGrouping::FullNameSimple(MatchLevel::Exact) => vec![PhoneLocatedNameMatches])]
    #[test_case(NameGrouping::FullNameSimple(MatchLevel::NoMatch) => vec![PhoneLocatedNameDoesNotMatch])]
    #[test_case(NameGrouping::FullNameSimple(MatchLevel::Partial) => vec![PhoneLocatedNamePartiallyMatches])]

    fn test_name_phone_codes(name_grouping: NameGrouping) -> Vec<FootprintReasonCode> {
        name_grouping.phone_codes()
    }

    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::StreetName, MatchLevel::Exact)) => vec![AddressStreetNameMatches])]
    // only thing that can return a partial match
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::StreetName, MatchLevel::Partial)) => vec![AddressStreetNamePartiallyMatches])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::StreetName, MatchLevel::NoMatch)) => vec![AddressStreetNameDoesNotMatch])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::StreetName, MatchLevel::CouldNotMatch)) => vec![AddressStreetNameDoesNotMatch])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::StreetNumber, MatchLevel::Exact)) => vec![AddressStreetNumberMatches])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::StreetNumber, MatchLevel::NoMatch)) => vec![AddressStreetNumberDoesNotMatch])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::StreetNumber, MatchLevel::CouldNotMatch)) => vec![AddressStreetNumberDoesNotMatch])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::Zip, MatchLevel::Exact)) => vec![AddressZipCodeMatches])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::Zip, MatchLevel::NoMatch)) => vec![AddressZipCodeDoesNotMatch])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::Zip, MatchLevel::CouldNotMatch)) => vec![AddressZipCodeDoesNotMatch])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::City, MatchLevel::Exact)) => vec![AddressCityMatches])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::City, MatchLevel::NoMatch)) => vec![AddressCityDoesNotMatch])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::City, MatchLevel::CouldNotMatch)) => vec![AddressCityDoesNotMatch])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::State, MatchLevel::Exact)) => vec![AddressStateMatches])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::State, MatchLevel::NoMatch)) => vec![AddressStateDoesNotMatch])]
    #[test_case(AddressGrouping::SingleAddress((AddressAttribute::State, MatchLevel::CouldNotMatch)) => vec![AddressStateDoesNotMatch])]
    // Full
    #[test_case(AddressGrouping::FullAddress(MatchLevel::Exact) => vec![AddressStreetNameMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches, AddressMatches])]
    #[test_case(AddressGrouping::FullAddress(MatchLevel::NoMatch) => vec![AddressStreetNameDoesNotMatch, AddressStreetNumberDoesNotMatch, AddressCityDoesNotMatch, AddressStateDoesNotMatch, AddressZipCodeDoesNotMatch, AddressDoesNotMatch])]
    // All Except
    #[test_case(AddressGrouping::AddressExactExcept(vec![(AddressAttribute::StreetName, MatchLevel::Partial)]) => vec![AddressStreetNamePartiallyMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches, AddressPartiallyMatches])]
    #[test_case(AddressGrouping::AddressExactExcept(vec![(AddressAttribute::StreetName, MatchLevel::Partial), (AddressAttribute::Zip, MatchLevel::NoMatch)]) => vec![AddressStreetNamePartiallyMatches, AddressZipCodeDoesNotMatch, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressPartiallyMatches])]
    #[test_case(AddressGrouping::FullAddressSimple(MatchLevel::NoMatch) => vec![AddressDoesNotMatch])]
    #[test_case(AddressGrouping::FullAddressSimple(MatchLevel::Partial) => vec![AddressPartiallyMatches])]
    #[test_case(AddressGrouping::FullAddressSimple(MatchLevel::Exact) => vec![AddressMatches])]
    fn test_address(address_grouping: AddressGrouping) -> Vec<FootprintReasonCode> {
        address_grouping.codes()
    }

    #[test_case(AddressGrouping::FullAddressSimple(MatchLevel::NoMatch) => vec![PhoneLocatedAddressDoesNotMatch])]
    #[test_case(AddressGrouping::FullAddressSimple(MatchLevel::Partial) => vec![PhoneLocatedAddressPartiallyMatches])]
    #[test_case(AddressGrouping::FullAddressSimple(MatchLevel::Exact) => vec![PhoneLocatedAddressMatches])]
    fn test_address_phone_codes(address_grouping: AddressGrouping) -> Vec<FootprintReasonCode> {
        address_grouping.phone_codes()
    }

    #[test_case(SsnTypes::SsnIsItin => vec![SsnInputIsItin])]
    #[test_case(SsnTypes::SsnInvalid => vec![SsnInputIsInvalid])]
    #[test_case(SsnTypes::Ssn4ExactMatch => vec![SsnMatches])]
    #[test_case(SsnTypes::Ssn9(MatchLevel::Exact) => vec![SsnMatches])]
    #[test_case(SsnTypes::Ssn9(MatchLevel::Partial) => vec![SsnPartiallyMatches])]
    #[test_case(SsnTypes::Ssn9(MatchLevel::NoMatch) => vec![SsnDoesNotMatch])]
    #[test_case(SsnTypes::Ssn9PartialMatchSubjectDeceased => vec![SsnPartiallyMatches, SubjectDeceased])]
    #[test_case(SsnTypes::Ssn9ExactMatchSubjectDeceased => vec![SsnMatches, SubjectDeceased])]
    fn test_ssn(ssn_type: SsnTypes) -> Vec<FootprintReasonCode> {
        ssn_type.codes()
    }
}
