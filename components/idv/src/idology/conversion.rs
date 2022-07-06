use newtypes::address::Address;
use newtypes::LeakToString;
use newtypes::*;
use std::fmt::Debug;
use std::fmt::Display;

use crate::IdologyConversionError;

/// Idology request, we'll only use this for U.S. citizens for now
/// as KYC requests differ for UK + other countries
#[derive(Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct IdologyRequest {
    username: String,
    password: String,
    first_name: String,
    last_name: String,
    address: String,
    city: String,
    /// 2-digit state code
    state: String,
    /// zip code must be 5 digits
    zip: String,
    ssn: String,
    dob_month: String,
    dob_year: String,
    dob_day: String,
    email: String,
    /// this must be 10 digits
    telephone: String,
}

impl Debug for IdologyRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("IdologyRequest")
            .field("username", &self.username)
            .field("...", &"..all identity information redacted".to_string())
            .finish()
    }
}

impl Display for IdologyRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("IdologyRequest")
            .field("username", &self.username)
            .field("...", &"..all identity information redacted".to_string())
            .finish()
    }
}

impl From<IdologyRequest> for Vec<(&str, String)> {
    fn from(value: IdologyRequest) -> Self {
        let IdologyRequest {
            username,
            password,
            first_name,
            last_name,
            address,
            city,
            state,
            zip,
            ssn,
            dob_month,
            dob_year,
            dob_day,
            email,
            telephone,
        } = value;

        vec![
            ("username", username),
            ("password", password),
            ("firstName", first_name),
            ("lastName", last_name),
            ("address", address),
            ("city", city),
            ("state", state),
            ("zip", zip),
            ("ssn", ssn),
            ("dobMonth", dob_month),
            ("dobYear", dob_year),
            ("dobDay", dob_day),
            ("email", email),
            ("telephone", telephone),
        ]
    }
}

type SocureUsername = String;
type SocurePassword = String;
/// identify request and vec of modules we want to use
impl TryFrom<(IdentifyRequest, SocureUsername, SocurePassword)> for IdologyRequest {
    type Error = crate::IdologyError;

    fn try_from(value: (IdentifyRequest, String, String)) -> Result<Self, Self::Error> {
        let (value, username, password) = value;

        let IdentifyRequest {
            first_name,
            last_name,
            dob,
            ssn,
            email,
            phone,
            address,
        } = value;

        let Address {
            street_address,
            street_address_2,
            city,
            state,
            zip,
            country,
        } = address;

        // country must be US
        let country = country.leak_to_string();
        if country != "US" {
            return Err(IdologyConversionError::UnsupportedCountry(country).into());
        }

        // phone number must be 10 digits
        let telephone = phone.clone().leak_to_string().replace('+', "");
        if telephone.len() != 10 {
            return Err(IdologyConversionError::UnsupportedPhoneNumber(phone).into());
        }

        // per idology API, zip code must be 5 digits
        let zip = zip.leak_to_string();
        let numeric_zip: String = zip.chars().into_iter().filter(|c| c.is_ascii_digit()).collect();
        if numeric_zip.len() != 5 {
            return Err(IdologyConversionError::UnsupportedZipFormat.into());
        }

        // collapse address
        let mut address = street_address.leak_to_string();
        if let Some(address_2) = street_address_2 {
            address = format!("{} {}", address, address_2.leak_to_string());
        }

        let dob_str = dob.leak_to_string();
        let dob_split = dob_str.split('-').collect::<Vec<&str>>();

        let (dob_year, dob_month, dob_day) = (
            dob_split[0].to_string(),
            dob_split[1].to_string(),
            dob_split[2].to_string(),
        );

        Ok(Self {
            username,
            password,
            first_name: first_name.leak_to_string(),
            last_name: last_name.leak_to_string(),
            ssn: ssn.leak_to_string(),
            email: email.leak_to_string(),
            telephone,
            // no restrictions on address
            address,
            // no restrictions on city
            city: city.leak_to_string(),
            // state is already 2 digit us state
            state: state.leak_to_string(),
            zip: numeric_zip,
            dob_year,
            dob_month,
            dob_day,
        })
    }
}
