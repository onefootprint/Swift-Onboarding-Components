use super::SocureConversionError;
use chrono::{DateTime, Utc};
use newtypes::dob::DateOfBirth;
use newtypes::*;
use std::fmt::Debug;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SocureRequest {
    // TODO: which fields are mandatory based on the modules we are using
    modules: Vec<String>,
    first_name: Option<PiiString>,
    sur_name: Option<PiiString>,
    dob: Option<PiiString>, // YYYY-MM-DD
    national_id: Option<PiiString>,
    email: Option<PiiString>,
    mobile_number: Option<PiiString>, // e164 format, from twilio
    physical_address: Option<PiiString>,
    physical_address_2: Option<PiiString>,
    city: Option<PiiString>,
    state: Option<PiiString>, // 2 digit ISO 3166-2
    zip: Option<PiiString>,   // 5 or 9 digit
    country: Option<PiiString>,
    user_consent: bool,
    consent_timestamp: DateTime<Utc>,
    device_session_id: Option<String>,
}

/// identify request and vec of modules we want to use
impl SocureRequest {
    // TODO: make this TryFrom<IdvData> instead
    pub fn new(
        modules: Vec<String>,
        idv_data: IdvData,
        device_session_id: Option<String>,
    ) -> Result<Self, crate::socure::Error> {
        let IdvData {
            first_name,
            last_name,
            address_line1,
            address_line2,
            city,
            state,
            zip,
            country,
            ssn4: _,
            ssn9,
            dob,
            email,
            phone_number,
        } = idv_data;

        // TODO: this zip code validation logic already existed- unsure if its entirely necessary:
        // per socure API, zip code must either be 5 or 9 digits. hyphens
        // are optional, but it can't contain spaces (which we allow)
        // filter only for digits & check length before sending
        // let zip = zip.leak_to_string();
        // let numeric_zip: String = zip.chars().into_iter().filter(|c| c.is_ascii_digit()).collect();
        // if numeric_zip.len() != 9 && numeric_zip.len() != 5 {
        //     return Err(crate::SocureConversionError::UnsupportedZipFormat.into());
        // }

        let dob = dob
            .map(|dob| DateOfBirth::try_from(dob).map_err(|_| SocureConversionError::CantParseDob))
            .transpose()?
            .map(|dob| dob.yyyy_mm_dd());

        Ok(Self {
            modules,
            first_name,
            sur_name: last_name,
            dob,
            national_id: ssn9,
            email,
            mobile_number: phone_number,
            physical_address: address_line1,
            physical_address_2: address_line2,
            city,
            state,
            zip,
            country,
            user_consent: true, // TODO: can we hardcode to true or do we need to more explicitly route the users consent to here
            consent_timestamp: Utc::now(), // TODO: same as above
            device_session_id,
        })
    }
}
