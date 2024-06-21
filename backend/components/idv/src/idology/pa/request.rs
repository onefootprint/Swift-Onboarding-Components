use crate::idology::error as IdologyError;
use chrono::Datelike;
use chrono::NaiveDate;
use newtypes::IdvData;
use newtypes::PiiString;
use newtypes::DATE_FORMAT;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RequestData {
    first_name: PiiString,
    last_name: PiiString,
    address: PiiString,
    dob_month: Option<PiiString>,
    dob_year: Option<PiiString>,
    dob_day: Option<PiiString>,
    city: Option<PiiString>,
    state: Option<PiiString>,
    zip: Option<PiiString>,
    // we use invoice field to pass through a tenant identifier so we can keep track of things on the idology
    // side
    invoice: Option<String>,
}

impl RequestData {
    pub fn try_from(d: IdvData, tenant_identifier: String) -> Result<Self, IdologyError::ConversionError> {
        let IdvData {
            first_name,
            middle_name: _, // Idology doesn't utilize middle names
            last_name,
            address_line1,
            address_line2: _,
            city,
            state,
            zip,
            country: _,
            ssn4: _,
            ssn9: _,
            dob,
            email: _,
            phone_number: _,
            verification_request_id: _,
            drivers_license_number: _,
            drivers_license_state: _,
            itin: _,
        } = d;
        let first_name = first_name.ok_or(IdologyError::ConversionError::MissingFirstName)?;
        let last_name = last_name.ok_or(IdologyError::ConversionError::MissingLastName)?;
        let address = address_line1.ok_or(IdologyError::ConversionError::MissingAddress)?;
        // TODO: pull this out in common util
        let (dob_month, dob_year, dob_day) = if let Some(dob) = dob {
            let dob = NaiveDate::parse_from_str(dob.leak(), DATE_FORMAT)
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
            city,
            state,
            zip,
            invoice: Some(tenant_identifier),
        };
        Ok(request)
    }
}
