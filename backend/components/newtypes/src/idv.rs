use crate::{IdentityDataKind, PiiString};
use strum::IntoEnumIterator;

#[derive(Debug, Clone, Default)]
pub struct IdvData {
    pub first_name: Option<PiiString>,
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
            .flat_map(|attr| {
                match attr {
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
                }
                .is_some()
                .then_some(attr)
            })
            .collect()
    }
}
