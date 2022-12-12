use crate::{DataLifetimeKind, PiiString};
use strum::IntoEnumIterator;

#[derive(Debug, Clone)]
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

    pub fn present_data_attributes(&self) -> Vec<DataLifetimeKind> {
        DataLifetimeKind::iter()
            .flat_map(|attr| {
                match attr {
                    DataLifetimeKind::FirstName => self.first_name.as_ref(),
                    DataLifetimeKind::LastName => self.last_name.as_ref(),
                    DataLifetimeKind::Dob => self.dob.as_ref(),
                    DataLifetimeKind::Ssn9 => self.ssn9.as_ref(),
                    DataLifetimeKind::AddressLine1 => self.address_line1.as_ref(),
                    DataLifetimeKind::AddressLine2 => self.address_line2.as_ref(),
                    DataLifetimeKind::City => self.city.as_ref(),
                    DataLifetimeKind::State => self.state.as_ref(),
                    DataLifetimeKind::Zip => self.zip.as_ref(),
                    DataLifetimeKind::Country => self.country.as_ref(),
                    DataLifetimeKind::Email => self.email.as_ref(),
                    DataLifetimeKind::PhoneNumber => self.phone_number.as_ref(),
                    DataLifetimeKind::Ssn4 => self.ssn4.as_ref(),
                    DataLifetimeKind::IdentityDocument => None, // not part of IdvData
                }
                .is_some()
                .then_some(attr)
            })
            .collect()
    }
}
