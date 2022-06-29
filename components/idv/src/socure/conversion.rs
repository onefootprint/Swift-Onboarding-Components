use newtypes::address::Address;
use newtypes::LeakToString;
use std::fmt::Debug;
use std::fmt::Display;

#[derive(Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SocureAddress {
    pub physical_address: String,
    pub physical_address_2: Option<String>,
    pub city: String,
    // The state, province, or region where the consumer resides, specified in ISO 3166-2 format.
    pub state: String,
    // The consumer's five or nine digit ZIP code in valid postal address format. Hyphens are optional.
    pub zip: String,
    // The country where the consumer resides, specified in ISO 3166-1 alpha-2 format.
    pub country: String,
}

impl Debug for SocureAddress {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SocureAddress")
            .field("physicalAddress", &"<redacted>")
            .field("physicalAddress2", &"<redacted>")
            .field("city", &"<redacted>")
            .field("state", &"<redacted>")
            .field("zip", &"<redacted>")
            .field("country", &self.country)
            .finish()
    }
}

impl Display for SocureAddress {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SocureAddress")
            .field("physicalAddress", &"<redacted>")
            .field("physicalAddress2", &"<redacted>")
            .field("city", &"<redacted>")
            .field("state", &"<redacted>")
            .field("zip", &"<redacted>")
            .field("country", &self.country)
            .finish()
    }
}

impl TryFrom<Address> for SocureAddress {
    type Error = crate::SocureError;

    fn try_from(value: Address) -> Result<Self, Self::Error> {
        let Address {
            street_address,
            street_address_2,
            city,
            state,
            zip,
            country,
        } = value;

        // per socure API, zip code must either be 5 or 9 digits. hyphens
        // are optional, but it can't contain spaces (which we allow)
        // filter only for digits & check length before sending
        let zip = zip.leak_to_string();
        let numeric_zip: String = zip.chars().into_iter().filter(|c| c.is_digit(10)).collect();
        if numeric_zip.len() != 9 && numeric_zip.len() != 5 {
            return Err(crate::SocureConversionError::UnsupportedZipFormat.into());
        }

        Ok(Self {
            // no restrictions on physical address
            physical_address: street_address.leak_to_string(),
            physical_address_2: street_address_2.map(|val| val.leak_to_string()),
            // no restrictions on city
            city: city.leak_to_string(),
            // state is already 2 digit us state
            state: state.leak_to_string(),
            zip: numeric_zip,
            // country is already 2 digit country code
            country: country.leak_to_string(),
        })
    }
}
