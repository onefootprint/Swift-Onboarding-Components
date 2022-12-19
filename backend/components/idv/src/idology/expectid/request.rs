use crate::idology::error as IdologyError;
use newtypes::{dob::DateOfBirth, IdvData, PiiString};

/// Request to Idology ExpectID
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Request {
    pub(crate) username: PiiString,
    pub(crate) password: PiiString,
    pub(crate) age_to_check: u32,
    #[serde(flatten)]
    pub(crate) data: RequestData,
}

/// Idology request, we'll only use this for U.S. citizens for now
/// as KYC requests differ for UK + other countries
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RequestData {
    first_name: PiiString,
    last_name: PiiString,
    address: PiiString,
    city: Option<PiiString>,
    /// 2-digit state code
    state: Option<PiiString>,
    /// zip code must be 5 digits
    zip: Option<PiiString>,
    ssn_last4: Option<PiiString>,
    ssn: Option<PiiString>,
    dob_month: Option<PiiString>,
    dob_year: Option<PiiString>,
    dob_day: Option<PiiString>,
    email: Option<PiiString>,
    /// this must be 10 digits
    telephone: Option<PiiString>,
    output: String,
}

impl TryFrom<IdvData> for RequestData {
    type Error = IdologyError::ConversionError;

    fn try_from(d: IdvData) -> Result<Self, Self::Error> {
        let IdvData {
            first_name,
            last_name,
            address_line1,
            address_line2: _, // TODO
            city,
            state,
            zip,
            country: _,
            ssn4,
            ssn9,
            dob,
            email,
            phone_number,
        } = d;
        let first_name = first_name.ok_or(IdologyError::ConversionError::MissingFirstName)?;
        let last_name = last_name.ok_or(IdologyError::ConversionError::MissingLastName)?;
        let address = address_line1.ok_or(IdologyError::ConversionError::MissingAddress)?; // TODO
        let (dob_month, dob_year, dob_day) = if let Some(dob) = dob {
            let dob = DateOfBirth::try_from(dob).map_err(|_| IdologyError::ConversionError::CantParseDob)?;
            (
                Some(dob.month.into()),
                Some(dob.year.into()),
                Some(dob.day.into()),
            )
        } else {
            (None, None, None)
        };

        let request = Self {
            first_name,
            last_name,
            address,
            city,
            state,
            zip,
            ssn_last4: ssn4,
            ssn: ssn9,
            dob_month,
            dob_year,
            dob_day,
            email,
            // TODO remove country code
            telephone: phone_number,
            output: "json".to_owned(),
        };
        Ok(request)
    }
}
