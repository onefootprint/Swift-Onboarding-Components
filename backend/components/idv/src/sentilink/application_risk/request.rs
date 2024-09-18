use chrono::DateTime;
use chrono::Utc;
use newtypes::sentilink::SentilinkProduct;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use serde::Deserialize;
use serde::Serialize;

#[derive(Serialize)]
pub struct ApplicationRiskRequest {
    pub application: Application,
    pub products: Vec<SentilinkProduct>,
}

#[derive(Serialize, Deserialize)]
pub struct Application {
    // ID of application.
    application_id: String,
    // Timestamp string of application, default: timestamp string for when SentiLink receives the request.
    application_created: DateTime<Utc>,
    // ID of customer.
    user_id: String,
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
    country_code: PiiString,
    city: PiiString,
    state_code: PiiString,
    // Zipcode of customer address. Other accepted formats: "12345-9999".
    zipcode: PiiString,
    phone: PiiString,
    email: PiiString,
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
