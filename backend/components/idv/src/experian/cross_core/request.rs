use crate::experian::error::{
    ConversionError,
    Error,
};
use crate::experian::{
    normalize_address_line_1,
    normalize_city,
    normalize_name,
};
use chrono::{
    DateTime,
    NaiveDate,
    SecondsFormat,
    Utc,
};
use newtypes::experian::{
    AddressType,
    ApplicantType,
    DocumentType,
    TypeOfPerson,
};
use newtypes::{
    IdvData,
    PiiString,
};

/// This is the top level request to CrossCore
#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CrossCoreAPIRequest {
    pub header: BodyHeader,
    pub payload: BodyPayload,
}

impl CrossCoreAPIRequest {
    // need to use our own method since we require more than IdvData to build the req
    pub(crate) fn try_from(
        idv_data: IdvData,
        config: PreciseIDRequestConfig,
        is_production: bool,
    ) -> Result<Self, Error> {
        let control_options = config.control_options.clone();
        let body_header = BodyHeader::from(config);

        let contact = Contact::try_from(idv_data, is_production)?;
        let application_contact = ApplicationContact::new(&contact);

        let application = Application {
            applicants: vec![application_contact],
            product_details: None,
        };

        let body_payload = BodyPayload {
            control: control_options,
            contacts: vec![contact],
            application,
        };

        Ok(Self {
            header: body_header,
            payload: body_payload,
        })
    }
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BodyHeader {
    // The ID for our instance
    pub tenant_id: String,
    // This is the scenario defined in the CrossCore configuration used to determine which back- ing
    // applications are contacted and in what order.
    pub request_type: String,
    // Reference ID that you provide for each specific call to CrossCore. This ID does not have to be unique.
    // You can reuse the same ID if desired, although using a unique ID for each call is best practice.
    pub client_reference_id: String,
    // The time of the request.
    // MUST be in RFC3339 format (YYYY-MM-DDTHH:MM:SSZ)
    pub message_time: String,
    // must be provided, but can be empty
    pub options: BodyHeaderOptions,
}

impl From<PreciseIDRequestConfig> for BodyHeader {
    fn from(config: PreciseIDRequestConfig) -> Self {
        let message_time = config.message_time.to_rfc3339_opts(SecondsFormat::Secs, true);
        Self {
            tenant_id: config.tenant_id,
            request_type: config.request_type,
            client_reference_id: config.client_reference_id,
            message_time,
            // can be empty, but is required
            options: BodyHeaderOptions { ..Default::default() },
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct BodyHeaderOptions {
    pub version: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BodyPayload {
    pub control: Vec<ControlOption>,
    pub contacts: Vec<Contact>,
    pub application: Application,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ControlOption {
    pub option: PiiString,
    pub value: PiiString,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Contact {
    // Value used to cross-reference pieces of data to other objects within the message. The value is
    // whatever you decide to code it as. When you need to reference this object, you will use the id
    // value from this object in the target object to associate this object to the target object.
    pub id: Option<String>,
    pub person: Person,
    pub addresses: Vec<Address>,
    pub telephones: Vec<Telephone>,
    pub emails: Vec<Email>,
    pub identity_documents: Vec<IdentityDocument>,
}

impl Contact {
    pub fn try_from(d: IdvData, is_production: bool) -> Result<Contact, ConversionError> {
        let state_and_country = d.state_and_country_for_vendors();
        let IdvData {
            first_name,
            middle_name: _,
            last_name,
            address_line1,
            address_line2,
            city,
            state: _,
            zip,
            country: _,
            // TODO figure out how to send this? prob a doc type enum
            ssn4,
            // TODO: was getting invalid errors when testing this when optional, so figure out if required
            ssn9,
            dob,
            email,
            phone_number,
            verification_request_id: _,
            drivers_license_number: _,
            drivers_license_state: _,
        } = d;

        let first_name = first_name
            .ok_or(ConversionError::MissingFirstName)?
            .map(|s| normalize_name(s.as_str()));
        let last_name = last_name
            .ok_or(ConversionError::MissingLastName)?
            .map(|s| normalize_name(s.as_str()))
            .map(crate::elongate_if_single_letter);
        let address = address_line1
            .ok_or(ConversionError::MissingAddress)?
            .map(|s| normalize_address_line_1(s.as_str()));
        let normalized_city = city.map(|c| c.map(|p| normalize_city(p.as_str())));
        let person_details = if let Some(d) = dob {
            let parsed_dob =
                NaiveDate::parse_from_str(d.leak(), "%Y-%m-%d").map_err(|_| ConversionError::CantParseDob)?;

            Some(PersonDetails {
                date_of_birth: Some(parsed_dob.to_string()),
            })
        } else {
            None
        };

        let person_name = PersonName {
            id: Some(ExperianRequestDatumIdentifiers::PersonName1.to_string()),
            first_name,
            sur_name: last_name,
        };

        let person = Person {
            names: vec![person_name],
            type_of_person: TypeOfPerson::Applicant,
            person_identifier: None,
            person_details,
        };

        let address = Address {
            id: Some(ExperianRequestDatumIdentifiers::Address1.to_string()),
            address_type: AddressType::Current,
            street: address,
            street2: address_line2,
            post_town: normalized_city,
            postal: zip,
            state_province_code: state_and_country.state,
            country_code: state_and_country.country,
        };

        let emails = if is_production {
            vec![Email {
                id: Some(ExperianRequestDatumIdentifiers::Email1.to_string()),
                email,
            }]
        } else {
            vec![]
        };
        let phones = if is_production {
            vec![Telephone {
                id: Some(ExperianRequestDatumIdentifiers::Phone1.to_string()),
                number: phone_number,
            }]
        } else {
            vec![]
        };
        let identity_document = {
            let ssn = match (ssn9, ssn4) {
                (Some(s9), _) => Some(s9),
                (None, Some(s4)) => Some(s4),
                _ => None,
            };
            IdentityDocument {
                document_number: ssn,
                document_type: Some(DocumentType::Ssn),
            }
        };

        Ok(Self {
            id: Some(ExperianRequestDatumIdentifiers::Contact1.to_string()),
            person,
            addresses: vec![address],
            telephones: phones,
            emails,
            identity_documents: vec![identity_document]
                .into_iter()
                .filter(|s| s.document_number.is_some())
                .collect(),
        })
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Person {
    pub names: Vec<PersonName>,
    // Indicator for the person type
    pub type_of_person: TypeOfPerson,
    // Client identifier for person
    pub person_identifier: Option<String>,
    pub person_details: Option<PersonDetails>,
}

// Details relating to the person object.
// There's A LOT more in the API spec we can use if we want
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonDetails {
    // YYYY-MM-DD
    pub date_of_birth: Option<String>,
}
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PersonName {
    // Value used to cross-reference pieces of data to other objects within the message.
    pub id: Option<String>,
    pub first_name: PiiString,
    pub sur_name: PiiString,
}

/// Information pertaining to an address
/// A lot more we can use here in the API spec
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Address {
    // Value used to cross-reference pieces of data to other objects within the message.
    pub id: Option<String>,
    pub address_type: AddressType,
    pub street: PiiString,
    pub street2: Option<PiiString>,
    pub post_town: Option<PiiString>,
    pub postal: Option<PiiString>,
    pub state_province_code: Option<PiiString>,
    pub country_code: Option<PiiString>,
}

/// Information pertaining to a phone
/// A lot more we can use here in the API spec
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Telephone {
    // Value used to cross-reference pieces of data to other objects within the message.
    pub id: Option<String>,
    pub number: Option<PiiString>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Email {
    // Value used to cross-reference pieces of data to other objects within the message.
    pub id: Option<String>,
    // The following special characters are not allowed, if included, the email address will not be included
    // in the request to Precise ID: < > % & + = [ { ] : ; ? *
    pub email: Option<PiiString>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
// TODO
pub struct IdentityDocument {
    pub document_number: Option<PiiString>,
    pub document_type: Option<DocumentType>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Application {
    pub applicants: Vec<ApplicationContact>,
    pub product_details: Option<ApplicationProductDetails>,
}
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApplicationProductDetails {
    // Type of account or product being applied for.
    // Only required for FCRA Resellers inquiries.
    pub product_type: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApplicationContact {
    // unique identifier
    pub id: Option<String>,
    // Should be the same as Contact#id
    pub contact_id: Option<String>,
    // should be APPLICANT for precise ID, since they only process 1 req at a time
    pub applicant_type: ApplicantType,
}

impl ApplicationContact {
    fn new(c: &Contact) -> Self {
        Self {
            id: Some(ExperianRequestDatumIdentifiers::Application1.to_string()),
            contact_id: c.id.clone(),
            applicant_type: ApplicantType::Applicant,
        }
    }
}

pub struct PreciseIDRequestConfig {
    pub control_options: Vec<ControlOption>,
    // The ID for our instance
    pub tenant_id: String,
    // This is the scenario defined in the CrossCore configuration used to determine which back- ing
    // applications are contacted and in what order.
    pub request_type: String,
    // Reference ID that you provide for each specific call to CrossCore. This ID does not have to be unique.
    // You can reuse the same ID if desired, although using a unique ID for each call is best practice.
    pub client_reference_id: String,
    // The time of the request.
    pub message_time: DateTime<Utc>,
}

/// These are the keys we give our data as required by experian
#[derive(Debug, strum::Display, strum::EnumString, Clone, Eq, PartialEq, serde::Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
enum ExperianRequestDatumIdentifiers {
    Contact1,
    Email1,
    Address1,
    PersonName1,
    Phone1,
    Application1,
}
