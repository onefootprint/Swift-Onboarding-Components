use crate::idology::error as IdologyError;
use chrono::{Datelike, NaiveDate};
use newtypes::{IdvData, PiiString};

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RequestData {
    first_name: PiiString,
    last_name: PiiString,
    address: PiiString,
    dob_month: Option<PiiString>,
    dob_year: Option<PiiString>,
    dob_day: Option<PiiString>,
    // TODO: confirm with Justyn if/how to use city/state/zip and other fields
    // city: Option<PiiString>,
    // state: Option<PiiString>,
    // zip: Option<PiiString>,
}

impl TryFrom<IdvData> for RequestData {
    type Error = IdologyError::ConversionError;

    fn try_from(d: IdvData) -> Result<Self, Self::Error> {
        let IdvData {
            first_name,
            last_name,
            address_line1,
            address_line2: _,
            city: _,
            state: _,
            zip: _,
            country: _,
            ssn4: _,
            ssn9: _,
            dob,
            email: _,
            phone_number: _,
        } = d;
        let first_name = first_name.ok_or(IdologyError::ConversionError::MissingFirstName)?;
        let last_name = last_name.ok_or(IdologyError::ConversionError::MissingLastName)?;
        let address = address_line1.ok_or(IdologyError::ConversionError::MissingAddress)?;
        // TODO: pull this out in common util
        let (dob_month, dob_year, dob_day) = if let Some(dob) = dob {
            let dob = NaiveDate::parse_from_str(dob.leak(), "%Y-%m-%d")
                .map_err(|_| IdologyError::ConversionError::CantParseDob)?;
            (
                Some(PiiString::new(dob.month().to_string())),
                Some(PiiString::new(dob.year().to_string())),
                Some(PiiString::new(dob.day().to_string())),
            )
        } else {
            (None, None, None)
        };

        let request = Self {
            first_name,
            last_name,
            address,
            dob_month,
            dob_year,
            dob_day,
        };
        Ok(request)
    }
}
