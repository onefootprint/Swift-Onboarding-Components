use crate::{BusinessOwnerData, IdentityDataKind, PiiString, VerificationRequestId, DATE_FORMAT};
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use strum::IntoEnumIterator;

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct IdvData {
    pub first_name: Option<PiiString>,
    // TODO: add middle_name
    pub last_name: Option<PiiString>,
    pub address_line1: Option<PiiString>,
    pub address_line2: Option<PiiString>,
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub zip: Option<PiiString>,
    pub country: Option<PiiString>,
    pub ssn4: Option<PiiString>,
    pub ssn9: Option<PiiString>,
    pub dob: Option<PiiString>,
    pub email: Option<PiiString>,
    pub phone_number: Option<PiiString>,
    // this is convenient to have
    pub verification_request_id: Option<VerificationRequestId>,
}

impl IdvData {
    pub fn name(&self) -> Option<String> {
        match (self.first_name.as_ref(), self.last_name.as_ref()) {
            (Some(first_name), Some(last_name)) => {
                Some(format!("{} {}", first_name.leak(), last_name.leak()))
            }
            (Some(name), None) | (None, Some(name)) => Some(name.leak_to_string()),
            (None, None) => None,
        }
    }

    pub fn present_data_attributes(&self) -> Vec<IdentityDataKind> {
        IdentityDataKind::iter()
            .flat_map(|attr| self.get(attr).is_some().then_some(attr))
            .collect()
    }

    pub fn get(&self, idk: IdentityDataKind) -> Option<&PiiString> {
        match idk {
            IdentityDataKind::FirstName => self.first_name.as_ref(),
            IdentityDataKind::LastName => self.last_name.as_ref(),
            IdentityDataKind::Dob => self.dob.as_ref(),
            IdentityDataKind::Ssn4 => self.ssn4.as_ref(),
            IdentityDataKind::Ssn9 => self.ssn9.as_ref(),
            IdentityDataKind::AddressLine1 => self.address_line1.as_ref(),
            IdentityDataKind::AddressLine2 => self.address_line2.as_ref(),
            IdentityDataKind::City => self.city.as_ref(),
            IdentityDataKind::State => self.state.as_ref(),
            IdentityDataKind::Zip => self.zip.as_ref(),
            IdentityDataKind::Country => self.country.as_ref(),
            IdentityDataKind::Email => self.email.as_ref(),
            IdentityDataKind::PhoneNumber => self.phone_number.as_ref(),
            IdentityDataKind::Nationality
            | IdentityDataKind::UsLegalStatus
            | IdentityDataKind::VisaKind
            | IdentityDataKind::VisaExpirationDate
            | IdentityDataKind::Citizenships
            | IdentityDataKind::MiddleName => None,
        }
    }

    pub fn dob(&self) -> Result<Option<NaiveDate>, chrono::ParseError> {
        self.dob
            .as_ref()
            .map(|d| NaiveDate::parse_from_str(d.leak(), DATE_FORMAT))
            .transpose()
    }

    /// helper to normalize an idv data struct
    pub fn get_normalized(&self, idk: IdentityDataKind) -> Option<PiiString> {
        self.get(idk).map(|p| p.leak().trim().to_lowercase().into())
    }
}

// KYB analogs of IdvData, still TBD and subject to change
#[derive(Debug, Clone, Default)]
pub struct BoData {
    pub first_name: PiiString,
    pub last_name: PiiString,
}

#[derive(Debug, Clone, Default)]
pub struct BusinessData {
    pub name: Option<PiiString>,
    pub dba: Option<PiiString>,
    pub website_url: Option<PiiString>,
    pub phone_number: Option<PiiString>,
    pub tin: Option<PiiString>,
    pub address_line1: Option<PiiString>,
    pub address_line2: Option<PiiString>,
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub zip: Option<PiiString>,
    pub business_owners: Vec<BoData>,
}

impl From<BusinessOwnerData> for BoData {
    fn from(value: BusinessOwnerData) -> Self {
        Self {
            first_name: value.first_name,
            last_name: value.last_name,
        }
    }
}
