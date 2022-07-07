use newtypes::address::Address;
use newtypes::*;
use std::fmt::Debug;

use crate::IdologyError;

/// Idology request, we'll only use this for U.S. citizens for now
/// as KYC requests differ for UK + other countries
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct IdologyRequest {
    username: PiiString,
    password: PiiString,
    first_name: PiiString,
    last_name: PiiString,
    address: Option<PiiString>,
    city: Option<PiiString>,
    /// 2-digit state code
    state: Option<PiiString>,
    /// zip code must be 5 digits
    zip: Option<PiiString>,
    ssn: PiiString,
    dob_month: PiiString,
    dob_year: PiiString,
    dob_day: PiiString,
    email: PiiString,
    /// this must be 10 digits
    telephone: PiiString,
}

type SocureUsername = PiiString;
type SocurePassword = PiiString;

impl IdologyRequest {
    /// identify request and vec of modules we want to use
    /// TODO: ensure we call this only on US users (US address/phone number)
    pub fn new(
        username: SocureUsername,
        password: SocurePassword,
        value: IdentifyRequest,
    ) -> Result<Self, IdologyError> {
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
            address,
            city,
            state,
            zip,
            country: _, // only US
        } = address;

        // phone number must be 10 digits
        let telephone = phone.without_us_country_code();

        Ok(Self {
            username,
            password,
            first_name: first_name.into(),
            last_name: last_name.into(),
            ssn: ssn.into(),
            email: email.into(),
            telephone,
            // no restrictions on address
            address: address.map(PiiString::from),
            // no restrictions on city
            city: city.map(PiiString::from),
            // state is already 2 digit us state
            state: state.map(PiiString::from),
            zip: zip.map(PiiString::from),
            dob_year: dob.year.into(),
            dob_month: dob.month.into(),
            dob_day: dob.day.into(),
        })
    }
}
