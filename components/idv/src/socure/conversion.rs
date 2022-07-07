use chrono::{naive::NaiveDateTime, Utc};
use newtypes::address::Address;
use newtypes::*;
use std::fmt::Debug;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SocureRequest {
    modules: Vec<String>,
    first_name: PiiString,
    sur_name: PiiString,
    /// YYYY-MM-DD
    dob: PiiString,
    national_id: PiiString,
    email: PiiString,
    /// e164 format, from twilio
    mobile_number: PiiString,
    physical_address: Option<PiiString>,
    physical_address_2: Option<PiiString>,
    city: Option<PiiString>,
    state: Option<PiiString>,
    zip: Option<PiiString>,
    country: Option<PiiString>,
    user_consent: bool,
    consent_timestamp: NaiveDateTime,
}

/// identify request and vec of modules we want to use
impl SocureRequest {
    pub fn new(modules: Vec<String>, request: IdentifyRequest) -> Result<Self, crate::SocureError> {
        let IdentifyRequest {
            first_name,
            last_name,
            dob,
            ssn,
            email,
            phone,
            address,
        } = request;

        let Address {
            address: street_address,
            city,
            state,
            zip,
            country,
        } = address;

        // if street_address.is_none() {
        //     return Err(crate::SocureConversionError::NoAddressPresent.into());
        // }

        // per socure API, zip code must either be 5 or 9 digits. hyphens
        // are optional, but it can't contain spaces (which we allow)
        // filter only for digits & check length before sending
        // let zip = zip.leak_to_string();
        // let numeric_zip: String = zip.chars().into_iter().filter(|c| c.is_ascii_digit()).collect();
        // if numeric_zip.len() != 9 && numeric_zip.len() != 5 {
        //     return Err(crate::SocureConversionError::UnsupportedZipFormat.into());
        // }

        Ok(Self {
            modules,
            first_name: first_name.into(),
            sur_name: last_name.into(),
            dob: dob.yyyy_mm_dd(),
            national_id: ssn.into(),
            email: email.into(),
            mobile_number: phone.into(),
            // no restrictions on physical address
            physical_address: street_address.as_ref().map(|s| s.street_address.clone().into()),
            physical_address_2: street_address
                .as_ref()
                .and_then(|s| s.street_address_2.clone().map(|s2| s2.into())),
            // no restrictions on city
            city: city.map(PiiString::from),
            // state is already 2 digit us state
            state: state.map(PiiString::from),
            zip: zip.map(PiiString::from),
            // country is already 2 digit country code
            country: country.map(PiiString::from),
            user_consent: true,
            consent_timestamp: Utc::now().naive_utc(),
        })
    }
}
