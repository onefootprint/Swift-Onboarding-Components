use itertools::Itertools;

use crate::{FootprintReasonCode, MatchLevel};
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
}
impl NameGrouping {
    fn codes(self) -> Vec<FootprintReasonCode> {
        match self {
            NameGrouping::FirstAndLast((fn_ml, ln_ml)) => {
                let first = NameAttribute::First.codes(fn_ml).into_iter();
                let last = NameAttribute::Last.codes(ln_ml).into_iter();

                first.chain(last).collect()
            }
            NameGrouping::FullName(ml) => Self::FirstAndLast((ml, ml)).codes(),
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
}

impl AddressGrouping {
    fn codes(self) -> Vec<FootprintReasonCode> {
        match self {
            AddressGrouping::SingleAddress((a, ml)) => a.codes(ml),
            AddressGrouping::FullAddress(ml) => AddressAttribute::iter()
                .flat_map(|a| Self::SingleAddress((a, ml)).codes())
                .collect(),
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
                except_codes.chain(rest_codes).collect()
            }
        }
    }
}

/// Helper for constructing Address and Name reason codes for internal use only!
///
/// Note: name is shortened to make constructing take up less line space
pub(crate) struct ExpRCH {
    name: NameGrouping,
    address: AddressGrouping,
}
impl ExpRCH {
    pub fn new(name: NameGrouping, address: AddressGrouping) -> Self {
        Self { name, address }
    }
}

impl From<ExpRCH> for Vec<FootprintReasonCode> {
    fn from(erch: ExpRCH) -> Self {
        let name_codes = erch.name.codes().into_iter();
        let address_codes = erch.address.codes().into_iter();

        name_codes.chain(address_codes).unique().collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;
    use FootprintReasonCode::*;

    #[test_case(NameGrouping::FirstAndLast((MatchLevel::Exact, MatchLevel::Exact)) => vec![NameFirstMatches, NameLastMatches])]
    #[test_case(NameGrouping::FirstAndLast((MatchLevel::Exact, MatchLevel::NoMatch)) => vec![NameFirstMatches, NameLastDoesNotMatch])]
    #[test_case(NameGrouping::FirstAndLast((MatchLevel::Exact, MatchLevel::CouldNotMatch)) => vec![NameFirstMatches, NameLastDoesNotMatch])]
    #[test_case(NameGrouping::FirstAndLast((MatchLevel::NoMatch, MatchLevel::Exact)) => vec![NameFirstDoesNotMatch, NameLastMatches])]
    #[test_case(NameGrouping::FirstAndLast((MatchLevel::CouldNotMatch, MatchLevel::Exact)) => vec![NameFirstDoesNotMatch, NameLastMatches])]
    #[test_case(NameGrouping::FullName(MatchLevel::Exact) => vec![NameFirstMatches, NameLastMatches])]
    #[test_case(NameGrouping::FullName(MatchLevel::NoMatch) => vec![NameFirstDoesNotMatch, NameLastDoesNotMatch])]
    #[test_case(NameGrouping::FullName(MatchLevel::Partial) => vec![NameFirstPartiallyMatches, NameLastPartiallyMatches])]
    // don't apply to name
    #[test_case(NameGrouping::FullName(MatchLevel::Verified) => Vec::<FootprintReasonCode>::new())]
    #[test_case(NameGrouping::FullName(MatchLevel::NotVerified) => Vec::<FootprintReasonCode>::new())]
    #[test_case(NameGrouping::FullName(MatchLevel::CouldNotMatch) => vec![NameFirstDoesNotMatch, NameLastDoesNotMatch])]

    fn test_name(name_grouping: NameGrouping) -> Vec<FootprintReasonCode> {
        name_grouping.codes()
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
    #[test_case(AddressGrouping::FullAddress(MatchLevel::Exact) => vec![AddressStreetNameMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches])]
    #[test_case(AddressGrouping::FullAddress(MatchLevel::NoMatch) => vec![AddressStreetNameDoesNotMatch, AddressStreetNumberDoesNotMatch, AddressCityDoesNotMatch, AddressStateDoesNotMatch, AddressZipCodeDoesNotMatch])]
    // All Except
    #[test_case(AddressGrouping::AddressExactExcept(vec![(AddressAttribute::StreetName, MatchLevel::Partial)]) => vec![AddressStreetNamePartiallyMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches])]
    #[test_case(AddressGrouping::AddressExactExcept(vec![(AddressAttribute::StreetName, MatchLevel::Partial), (AddressAttribute::Zip, MatchLevel::NoMatch)]) => vec![AddressStreetNamePartiallyMatches, AddressZipCodeDoesNotMatch, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches])]
    fn test_address(address_grouping: AddressGrouping) -> Vec<FootprintReasonCode> {
        address_grouping.codes()
    }

    #[test_case(NameGrouping::FullName(MatchLevel::Exact), AddressGrouping::FullAddress(MatchLevel::Exact) => vec![NameFirstMatches, NameLastMatches, AddressStreetNameMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches])]
    #[test_case(NameGrouping::FullName(MatchLevel::Exact), AddressGrouping::FullAddress(MatchLevel::NoMatch) => vec![NameFirstMatches, NameLastMatches, AddressStreetNameDoesNotMatch, AddressStreetNumberDoesNotMatch, AddressCityDoesNotMatch, AddressStateDoesNotMatch, AddressZipCodeDoesNotMatch])]
    #[test_case(NameGrouping::FullName(MatchLevel::Partial), AddressGrouping::FullAddress(MatchLevel::Exact) => vec![NameFirstPartiallyMatches, NameLastPartiallyMatches, AddressStreetNameMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches])]
    #[test_case(NameGrouping::FullName(MatchLevel::Exact), AddressGrouping::AddressExactExcept(vec![(AddressAttribute::StreetName, MatchLevel::Partial)]) => vec![NameFirstMatches, NameLastMatches, AddressStreetNamePartiallyMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches])]
    #[test_case(NameGrouping::FullName(MatchLevel::Partial), AddressGrouping::AddressExactExcept(vec![(AddressAttribute::StreetName, MatchLevel::Partial)]) => vec![NameFirstPartiallyMatches, NameLastPartiallyMatches, AddressStreetNamePartiallyMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches])]
    #[test_case(NameGrouping::FullName(MatchLevel::NoMatch), AddressGrouping::AddressExactExcept(vec![(AddressAttribute::StreetName, MatchLevel::Partial)]) => vec![NameFirstDoesNotMatch, NameLastDoesNotMatch, AddressStreetNamePartiallyMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches])]
    #[test_case(NameGrouping::FirstAndLast((MatchLevel::Exact, MatchLevel::NoMatch)), AddressGrouping::FullAddress(MatchLevel::Exact) => vec![NameFirstMatches, NameLastDoesNotMatch, AddressStreetNameMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches])]
    #[test_case(NameGrouping::FirstAndLast((MatchLevel::NoMatch, MatchLevel::Exact)), AddressGrouping::FullAddress(MatchLevel::Exact) => vec![NameFirstDoesNotMatch, NameLastMatches, AddressStreetNameMatches, AddressStreetNumberMatches, AddressCityMatches, AddressStateMatches, AddressZipCodeMatches])]

    fn test_experian_reason_code_helper(
        name: NameGrouping,
        address: AddressGrouping,
    ) -> Vec<FootprintReasonCode> {
        ExpRCH::new(name, address).into()
    }
}
