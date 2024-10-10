use crate::sentilink::error::Error as SentilinkError;
use crate::sentilink::SentilinkApplicationRiskRequest;
use chrono::DateTime;
use chrono::Utc;
use newtypes::output::Csv;
use newtypes::sentilink::SentilinkProduct;
use newtypes::IdentityDataKind;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use serde::Deserialize;
use serde::Serialize;
use std::str::FromStr;

#[derive(Serialize)]
pub struct ApplicationRiskRequest {
    pub application: Application,
    pub products: Vec<SentilinkProduct>,
}

#[derive(Serialize, Deserialize, Default)]
pub struct Application {
    // ID of application. We use workflow_id for now
    application_id: String,
    // Timestamp string of application, default: timestamp string for when SentiLink receives the request.
    application_created: DateTime<Utc>,
    // ID of customer.
    #[serde(skip_serializing_if = "Option::is_none")]
    user_id: Option<String>,
    // Timestamp string of customer account. creation. Other accepted formats: "2017-01-02", "2017-01-02
    // `00:00:00", "01022017", "02Jan2017", "01/22/2017".
    user_created: DateTime<Utc>,
    first_name: PiiString,
    last_name: PiiString,
    // Customer date of birth. Must be in YYYY-MM-DD format, more recent than 1901-12-31 and reflect an
    // applicant age >= 16.
    dob: PiiString,
    // REQUIRED FOR: synthetic fraud scores + first party scores and flags
    // NOT REQUIRED FOR: ID Theft score
    #[serde(skip_serializing_if = "Option::is_none")]
    ssn: Option<PiiString>,
    address_line_1: PiiString,
    #[serde(skip_serializing_if = "Option::is_none")]
    address_line_2: Option<PiiString>,
    #[serde(skip_serializing_if = "Option::is_none")]
    country_code: Option<PiiString>,
    city: PiiString,
    state_code: PiiString,
    // Zipcode of customer address. Other accepted formats: "12345-9999".
    zipcode: PiiString,
    #[serde(skip_serializing_if = "Option::is_none")]
    phone: Option<PiiString>,
    #[serde(skip_serializing_if = "Option::is_none")]
    email: Option<PiiString>,
    // TODO: figure out which IP address best represents the "one associated with the application". from wf
    // creation or from handoff?
    #[serde(skip_serializing_if = "Option::is_none")]
    ip_address: Option<PiiString>,
    // TODO: in concert with neuro?
    #[serde(skip_serializing_if = "Option::is_none")]
    device_id: Option<PiiString>,
    // Not relevant: Customer acquisition channel.
    #[serde(skip_serializing_if = "Option::is_none")]
    lead_type: Option<PiiString>,
    // Not relevant: The amount requested in the application, in dollars.
    #[serde(skip_serializing_if = "Option::is_none")]
    loan_amount: Option<PiiString>,
    // Not relevant: The currency of the requested loan, default: "USD".
    #[serde(skip_serializing_if = "Option::is_none")]
    loan_currency: Option<PiiString>,
    // Any other data in JSON format.
    #[serde(skip_serializing_if = "Option::is_none")]
    metadata: Option<PiiJsonValue>,
}


impl TryFrom<SentilinkApplicationRiskRequest> for ApplicationRiskRequest {
    type Error = SentilinkError;

    fn try_from(value: SentilinkApplicationRiskRequest) -> Result<Self, Self::Error> {
        let SentilinkApplicationRiskRequest {
            idv_data,
            products,
            credentials: _,
            workflow_id,
            ip_address,
        } = value;
        // Check products
        if products.is_empty() {
            return Err(SentilinkError::AssertionError(
                "no products specified".to_string(),
            ));
        }

        // Check data is present
        let present_dis = idv_data.present_data_attributes();
        let missing_required_fields: Vec<_> = products
            .iter()
            .map(|p| {
                let missing: Vec<_> = p
                    .required_identity_data_kinds()
                    .into_iter()
                    .filter(|d| !present_dis.contains(d))
                    .collect();
                (*p, Csv::from(missing))
            })
            .filter(|(_, missing)| !missing.is_empty())
            .collect();

        if !missing_required_fields.is_empty() {
            return Err(SentilinkError::MissingRequiredFields(missing_required_fields));
        };

        // Only US supported
        if idv_data.country.as_ref().is_some_and(|c| {
            Iso3166TwoDigitCountryCode::from_str(c.leak())
                .ok()
                .map(|iso| !iso.is_us_including_territories())
                .unwrap_or(false)
        }) {
            return Err(SentilinkError::UnsupportedCountry);
        }

        let get_di = |idk: IdentityDataKind| -> Result<PiiString, SentilinkError> {
            idv_data
                .get(idk)
                .cloned()
                .ok_or(SentilinkError::MissingRequiredField(idk))
        };

        // TODO: ip_address, user_id, user_created, device_id
        let application = Application {
            application_id: workflow_id.to_string(),
            application_created: Utc::now(),
            first_name: get_di(IdentityDataKind::FirstName)?,
            last_name: get_di(IdentityDataKind::LastName)?,
            dob: get_di(IdentityDataKind::Dob)?,
            ssn: idv_data.get(IdentityDataKind::Ssn9).cloned(),
            address_line_1: get_di(IdentityDataKind::AddressLine1)?,
            address_line_2: idv_data.get(IdentityDataKind::AddressLine2).cloned(),
            // Does this always have to be US?
            country_code: idv_data.get(IdentityDataKind::Country).cloned(),
            city: get_di(IdentityDataKind::City)?,
            state_code: get_di(IdentityDataKind::State)?,
            zipcode: get_di(IdentityDataKind::Zip)?,
            phone: idv_data.get(IdentityDataKind::PhoneNumber).cloned(),
            email: idv_data.get(IdentityDataKind::Email).cloned(),
            ip_address,
            ..Default::default()
        };

        let req = ApplicationRiskRequest {
            application,
            products,
        };

        Ok(req)
    }
}
