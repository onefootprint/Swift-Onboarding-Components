use crate::PiiString;

#[derive(Debug, Clone)]
pub struct IdvData {
    pub first_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
    pub address_line1: Option<PiiString>,
    pub address_line2: Option<PiiString>,
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub zip: Option<PiiString>,
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
}
