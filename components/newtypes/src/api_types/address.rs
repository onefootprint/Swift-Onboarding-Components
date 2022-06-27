pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Clone, Debug, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
/// Address includes street addresses, city, state, zip, and country.
/// We uppercase everything for standardization & standardize to valid 3 digit country code.
/// Zip code must be numeric
pub struct Address {
    street_address: StreetAddress,
    #[serde(default)]
    street_address_2: Option<StreetAddress>,
    city: City,
    state: State,
    zip: Zip,
    country: Country,
}

#[derive(Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(try_from = "String")]
/// String of either part 1 or 2 of your street address. We capitalize everything for standardization.
pub struct StreetAddress(String);

#[derive(Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
/// String of your city.
#[serde(try_from = "String")]
pub struct City(String);

#[derive(Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(try_from = "String")]
/// Full name of your U.S. State
pub struct State(String);

#[derive(Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(try_from = "String")]
/// String, totally numeric zip code
pub struct Zip(String);

#[derive(Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(try_from = "String")]
/// 3 digit ISO country code
pub struct Country(String);

macro_rules! redact_debug_display {
    ($name: ident) => {
        impl std::fmt::Display for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "<redacted>")
            }
        }

        impl std::fmt::Debug for $name {
            fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                write!(f, "<redacted>")
            }
        }
    };
}

impl TryFrom<String> for StreetAddress {
    type Error = crate::Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        // uppercase for consistency
        Ok(StreetAddress(value.to_uppercase()))
    }
}

redact_debug_display!(StreetAddress);

impl TryFrom<String> for City {
    type Error = crate::Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        // uppercase for consistency
        Ok(City(value.to_uppercase()))
    }
}

redact_debug_display!(City);

impl TryFrom<String> for State {
    type Error = crate::Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        // uppercase for consistency
        Ok(State(value.to_uppercase()))
    }
}

redact_debug_display!(State);

impl TryFrom<String> for Country {
    type Error = crate::Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        // uppercase for consistency
        Ok(Country(value.to_uppercase()))
    }
}

impl std::fmt::Display for Country {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // actually allow country for debugging
        write!(f, "{}", self.0)
    }
}

impl std::fmt::Debug for Country {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // actually allow country for debugging
        write!(f, "{}", self.0)
    }
}

impl TryFrom<String> for Zip {
    type Error = crate::Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        // todo, check numeric characters
        Ok(Zip(value.to_uppercase()))
    }
}

redact_debug_display!(Zip);

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn test_address() {
        let address =  "{\"street_address\": \"1 footprint way\", \"city\": \"new york\",  \"state\": \"NY\", \"country\": \"usa\", \"zip\": \"20009\"}";

        let address: Address = serde_json::from_str(address).unwrap();

        assert_eq!(
            address,
            Address {
                street_address: StreetAddress("1 FOOTPRINT WAY".to_string()),
                street_address_2: None,
                city: City("NEW YORK".to_string()),
                state: State("NY".to_string()),
                country: Country("USA".to_string()),
                zip: Zip("20009".to_string())
            }
        );

        assert_eq!(format!("{:?}", address), "Address { street_address: <redacted>, street_address_2: None, city: <redacted>, state: <redacted>, zip: <redacted>, country: USA }");
    }
}
