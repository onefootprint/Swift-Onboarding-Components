use crate::idology::error as IdologyError;
use chrono::Datelike;
use chrono::NaiveDate;
use newtypes::IdvData;
use newtypes::PiiString;

/// Idology request, we'll only use this for U.S. citizens for now
/// as KYC requests differ for UK + other countries
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RequestData {
    first_name: PiiString,
    last_name: PiiString,
    address: PiiString,
    address2: Option<PiiString>,
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
    // we use invoice field to pass through a tenant identifier so we can keep track of things on the idology
    // side
    invoice: Option<String>,
}

impl RequestData {
    pub fn try_from(d: IdvData, tenant_identifier: String) -> Result<Self, IdologyError::ConversionError> {
        let state_and_country = d.state_and_country_for_vendors();
        let IdvData {
            first_name,
            middle_name: _, // Idology doesn't utilize middle name
            last_name,
            address_line1,
            address_line2, // TODO
            city,
            state: _,
            zip,
            country: _,
            ssn4,
            ssn9,
            dob,
            email,
            phone_number,
            verification_request_id: _,
            drivers_license_number: _,
            drivers_license_state: _,
            itin: _,
        } = d;
        // these are minimum required fields for idology, so we error.
        let first_name = first_name.ok_or(IdologyError::ConversionError::MissingFirstName)?;
        let last_name = last_name
            .ok_or(IdologyError::ConversionError::MissingLastName)?
            .map(crate::elongate_if_single_letter);
        let address = address_line1.ok_or(IdologyError::ConversionError::MissingAddress)?; // TODO
                                                                                           // We need to send US territory in the state field
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
            address2: address_line2,
            city,
            state: state_and_country.state,
            zip,
            ssn_last4: ssn4,
            ssn: ssn9,
            dob_month,
            dob_year,
            dob_day,
            email,
            // TODO remove country code
            telephone: phone_number,
            invoice: Some(tenant_identifier),
        };
        Ok(request)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::idology::common::request::IdologyRequestData;
    use crate::idology::common::request::Request;
    use serde_json::json;

    #[test]
    fn test_serialization_expect_id() {
        let req = Request {
            username: PiiString::from("u".to_owned()),
            password: PiiString::from("p".to_owned()),
            output: "json".to_owned(),
            data: IdologyRequestData::ExpectId(RequestData {
                first_name: PiiString::from("bob".to_owned()),
                last_name: PiiString::from("boberto".to_owned()),
                address: PiiString::from("123 Main St".to_owned()),
                address2: Some(PiiString::from("Apt. 321".to_owned())),
                city: None,
                state: None,
                zip: None,
                ssn_last4: None,
                ssn: None,
                dob_month: None,
                dob_year: None,
                dob_day: None,
                email: None,
                telephone: None,
                invoice: Some("tenant_id:org_1234".into()),
            }),
        };

        let json_val = serde_json::to_value(req).unwrap();

        assert_eq!(
            json!({
              "username": "u",
              "password": "p",
              "firstName": "bob",
              "lastName": "boberto",
              "address": "123 Main St",
              "address2": "Apt. 321",
              "city": null,
              "state": null,
              "zip": null,
              "ssnLast4": null,
              "ssn": null,
              "dobMonth": null,
              "dobYear": null,
              "dobDay": null,
              "email": null,
              "telephone": null,
              "invoice": "tenant_id:org_1234",
              "output": "json"
            }),
            json_val
        );
    }
}
