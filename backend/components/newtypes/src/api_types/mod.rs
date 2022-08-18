use std::fmt::{Debug, Display};

use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

use crate::{DataKind};



pub mod address;
pub mod dob;
pub mod email;
pub mod name;
pub mod phone_number;
pub mod sandbox;
pub mod ssn;

/// Represents a string that hides PII
#[derive(Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash, Apiv2Schema)]
#[serde(transparent)]
pub struct PiiString(String);

/// helper macro to convert to PiiString
pub mod pii_helper {
    macro_rules! newtype_to_pii {
        ($type: ty) => {
            impl From<$type> for crate::PiiString {
                fn from(t: $type) -> Self {
                    crate::PiiString::from(t.0)
                }
            }
        };
    }

    pub(crate) use newtype_to_pii;
}

impl<T> From<T> for PiiString
where
    T: Display,
{
    fn from(pii: T) -> Self {
        Self(format!("{}", pii))
    }
}

impl PiiString {
    pub fn new(pii: String) -> Self {
        Self(pii)
    }

    pub fn leak(&self) -> &str {
        &self.0
    }

    pub fn leak_to_string(&self) -> String {
        self.0.clone()
    }

    /// compare PII to string
    pub fn equals(&self, s: &str) -> bool {
        self.0 == s
    }

    pub fn clean_for_fingerprint(&self) -> PiiString {
        PiiString(self.0.trim().to_lowercase())
    }
}

impl Debug for PiiString {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("<redacted>")
    }
}

pub struct NewData {
    pub data_kind: DataKind,
    pub data: PiiString,
}

impl NewData {
    pub fn list<P: Into<PiiString>>(data: Vec<(DataKind, P)>) -> Vec<Self> {
        data.into_iter()
            .map(|(data_kind, pii)| Self {
                data_kind,
                data: pii.into(),
            })
            .collect()
    }

    pub fn single<P: Into<PiiString>>(data_kind: DataKind, pii: P) -> Vec<Self> {
        vec![Self {
            data_kind,
            data: pii.into(),
        }]
    }
}
