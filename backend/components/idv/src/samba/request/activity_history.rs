use crate::samba::common::SambaOrderAddress;
use newtypes::samba::SambaData;
use newtypes::PiiString;
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateAHOrderRequest {
    // format of this differs by state
    // https://dev-devportal.sambasafety.io/guides/glossary.html#licene-number-patterns
    license_number: PiiString,
    // iso3166 2 char
    license_state: PiiString,
    first_name: PiiString,
    last_name: PiiString,
    // YYYY-MM-DD
    birth_date: Option<PiiString>,
    // A customer's custom billing code.
    bill_code: Option<PiiString>,
    // A customer's custom billing reference note
    bill_reference: Option<PiiString>,
    // The start date of the search for activity history
    // YYYY-MM-DD
    search_start_date: Option<String>,
    address: Option<SambaOrderAddress>,
}


impl From<SambaData> for CreateAHOrderRequest {
    fn from(value: SambaData) -> Self {
        let SambaData {
            first_name,
            last_name,
            license_number,
            license_state,
            dob,
            address,
            ..
        } = value;

        // TODO: does this need to be configurable?
        let search_start = chrono::Utc::now()
            .checked_sub_signed(chrono::Duration::days(365 * 2))
            .unwrap()
            .format("%Y-%m-%d")
            .to_string();

        Self {
            license_number,
            license_state,
            first_name,
            last_name,
            birth_date: dob,
            bill_code: None,
            bill_reference: None,
            search_start_date: Some(search_start),
            address: address.map(|a| a.into()),
        }
    }
}
