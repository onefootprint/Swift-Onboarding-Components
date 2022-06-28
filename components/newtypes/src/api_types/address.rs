pub use derive_more::{Add, Display, From, FromStr, Into};
use paperclip::actix::Apiv2Schema;
use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
/// Address includes street addresses, city, state, zip, and country.
/// We uppercase everything for standardization. Country must be 2 digit ISO-3166-1 Alpha 2 country code.
/// Inputs cannot contain special characters
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
/// cannot contain special characters, other than #
pub struct StreetAddress(String);

#[derive(Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
/// String of your city, cannot contain special characters
#[serde(try_from = "String")]
pub struct City(String);

#[derive(Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(try_from = "String")]
/// Name of your state or province, cannot contain special characters
pub struct State(String);

#[derive(Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Apiv2Schema)]
#[serde(try_from = "String")]
/// String, alphanumeric zip code, can also contain - or spaces
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

lazy_static! {
    // regex that checks for bad characters
    // does not check for "#" as often addresses can contain # (1111 Hope Street Apt #201W)
    pub static ref INVALID_ADDRESS_CHARS: Regex = Regex::new(r#"[!@$%^&*(),".?:{}|<>\\]"#).unwrap();
    // same as invalid address chars, but also checks for #
    pub static ref INVALID_INPUT_CHARS: Regex = Regex::new(r#"[!@$%^&*#(),".?:{}|<>\\]"#).unwrap();
    // some zip codes are alphanumeric, can also contain -'s and spaces
    // simple regex just to make sure input is base-level clean
    // https://en.wikipedia.org/wiki/Postal_code#Alphanumeric_postal_codes
    pub static ref ZIP_CHARS: Regex = Regex::new(r"^([A-Za-z0-9\- ]*)$").unwrap();
    // we only accept 2-digit country codes
    pub static ref COUNTRY_RE : Regex = Regex::new(r"^([A-Za-z]{2})$").unwrap();
}

impl TryFrom<String> for StreetAddress {
    type Error = crate::Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        if INVALID_ADDRESS_CHARS.is_match(value.as_str()) {
            return Err(crate::AddressError::InvalidAddressCharacters(value).into());
        }
        Ok(StreetAddress(value.to_uppercase()))
    }
}

redact_debug_display!(StreetAddress);

impl TryFrom<String> for City {
    type Error = crate::Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        if INVALID_INPUT_CHARS.is_match(value.as_str()) {
            return Err(crate::AddressError::InvalidCharacters(value).into());
        }
        Ok(City(value.to_uppercase()))
    }
}

redact_debug_display!(City);

impl TryFrom<String> for State {
    type Error = crate::Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        if INVALID_INPUT_CHARS.is_match(value.as_str()) {
            return Err(crate::AddressError::InvalidCharacters(value).into());
        }
        Ok(State(value.to_uppercase()))
    }
}

redact_debug_display!(State);

impl TryFrom<String> for Country {
    type Error = crate::Error;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        if !COUNTRY_RE.is_match(value.as_str()) {
            return Err(crate::AddressError::InvalidCountry(value).into());
        }
        let country = value.to_uppercase();
        if !ISO_3166_COUNTRIES.contains(&country.as_str()) {
            return Err(crate::AddressError::InvalidCountry(country).into());
        }
        Ok(Country(country))
    }
}

// list of valid iso3166-alpha-2 country codes, from https://datahub.io/core/country-codes#data
// eventually we should maybe just pony up and pay for the subscription to iso: https://www.iso.org/publication/PUB500001.html
// Channel islands does not have a country code
const ISO_3166_COUNTRIES: [&str; 249] = [
    "TW", "AF", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS",
    "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "VG",
    "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "HK", "MO", "CX", "CC",
    "CO", "KM", "CG", "CK", "CR", "HR", "CU", "CW", "CY", "CZ", "CI", "KP", "CD", "DK", "DJ", "DM", "DO",
    "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA",
    "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HM",
    "VA", "HN", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ",
    "KE", "KI", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MG", "MW", "MY", "MV",
    "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA",
    "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF", "MP", "NO", "OM", "PK", "PW", "PA", "PG",
    "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "KR", "MD", "RO", "RU", "RW", "RE", "BL", "SH", "KN",
    "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB",
    "SO", "ZA", "GS", "SS", "ES", "LK", "PS", "SD", "SR", "SJ", "SE", "CH", "SY", "TJ", "TH", "MK", "TL",
    "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "TZ", "UM", "VI", "US",
    "UY", "UZ", "VU", "VE", "VN", "WF", "EH", "YE", "ZM", "ZW", "AX",
];

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
        if !ZIP_CHARS.is_match(value.as_str()) {
            return Err(crate::AddressError::InvalidZip(value).into());
        }
        Ok(Zip(value))
    }
}

redact_debug_display!(Zip);

#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn test_address() {
        let address =  "{\"street_address\": \"1 footprint way\", \"city\": \"new york\",  \"state\": \"NY\", \"country\": \"us\", \"zip\": \"20009\"}";

        let bad_zip = "{\"street_address\": \"1 footprint way\", \"city\": \"new york\",  \"state\": \"NY\", \"country\": \"us\", \"zip\": \"20009@\"}";
        let bad_country = "{\"street_address\": \"1 footprint way\", \"city\": \"new york\",  \"state\": \"NY\", \"country\": \"USA\", \"zip\": \"20009\"}";
        let bad_address = "{\"street_address\": \"1 footprint way\x00\x01\x02\", \"city\": \"new york\",  \"state\": \"NY\", \"country\": \"us\", \"zip\": \"20009\"}";
        let good_address = "{\"street_address\": \"1 footprint way #201W\", \"city\": \"new york\",  \"state\": \"NY\", \"country\": \"us\", \"zip\": \"20009\"}";
        let bad_city = "{\"street_address\": \"1 footprint way\", \"city\": \"new york\x00#!?\",  \"state\": \"NY\", \"country\": \"us\", \"zip\": \"20009\"}";

        let bad_zip: Result<Address, _> = serde_json::from_str(bad_zip);
        let bad_country: Result<Address, _> = serde_json::from_str(bad_country);
        let bad_address: Result<Address, _> = serde_json::from_str(bad_address);
        let good_address: Result<Address, _> = serde_json::from_str(good_address);
        let bad_city: Result<Address, _> = serde_json::from_str(bad_city);

        assert!(bad_zip.is_err());
        assert!(bad_country.is_err());
        println!("{:?}", good_address);
        assert!(bad_address.is_err());
        assert!(good_address.is_ok());
        assert!(bad_city.is_err());

        let address: Address = serde_json::from_str(address).unwrap();

        assert_eq!(
            address,
            Address {
                street_address: StreetAddress("1 FOOTPRINT WAY".to_string()),
                street_address_2: None,
                city: City("NEW YORK".to_string()),
                state: State("NY".to_string()),
                country: Country("US".to_string()),
                zip: Zip("20009".to_string())
            }
        );

        assert_eq!(format!("{:?}", address), "Address { street_address: <redacted>, street_address_2: None, city: <redacted>, state: <redacted>, zip: <redacted>, country: US }");
    }
}
