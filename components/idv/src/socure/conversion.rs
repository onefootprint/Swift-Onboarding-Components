use chrono::{naive::NaiveDateTime, Utc};
use newtypes::address::Address;
use newtypes::LeakToString;
use newtypes::*;
use std::fmt::Debug;
use std::fmt::Display;

#[derive(Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SocureRequest {
    modules: Vec<String>,
    first_name: String,
    sur_name: String,
    /// YYYY-MM-DD
    dob: String,
    national_id: String,
    email: String,
    /// e164 format, from twilio
    mobile_number: String,
    physical_address: String,
    physical_address_2: Option<String>,
    city: String,
    state: String,
    zip: String,
    country: String,
    user_consent: bool,
    consent_timestamp: NaiveDateTime,
}

impl Debug for SocureRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SocureRequest")
            .field("modules", &self.modules)
            .field("country", &self.country)
            .field("consent_timestamp", &self.consent_timestamp)
            .field("...", &"..all identity information redacted".to_string())
            .finish()
    }
}

impl Display for SocureRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SocureRequest")
            .field("modules", &self.modules)
            .field("country", &self.country)
            .field("consent_timestamp", &self.consent_timestamp)
            .field("...", &"..all identity information redacted".to_string())
            .finish()
    }
}

/// identify request and vec of modules we want to use
impl TryFrom<(IdentifyRequest, Vec<String>)> for SocureRequest {
    type Error = crate::SocureError;

    fn try_from(value: (IdentifyRequest, Vec<String>)) -> Result<Self, Self::Error> {
        let (value, modules) = value;

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

        // per socure API, zip code must either be 5 or 9 digits. hyphens
        // are optional, but it can't contain spaces (which we allow)
        // filter only for digits & check length before sending
        let zip = zip.leak_to_string();
        let numeric_zip: String = zip.chars().into_iter().filter(|c| c.is_ascii_digit()).collect();
        if numeric_zip.len() != 9 && numeric_zip.len() != 5 {
            return Err(crate::SocureConversionError::UnsupportedZipFormat.into());
        }
        Ok(Self {
            modules,
            first_name: first_name.leak_to_string(),
            sur_name: last_name.leak_to_string(),
            dob: dob.leak_to_string(),
            national_id: ssn.leak_to_string(),
            email: email.leak_to_string(),
            mobile_number: phone.leak_to_string(),
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
            user_consent: true,
            consent_timestamp: Utc::now().naive_utc(),
        })
    }
}
