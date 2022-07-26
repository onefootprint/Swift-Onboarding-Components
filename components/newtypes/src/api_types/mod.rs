use std::fmt::{Debug, Display};

use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};

use crate::{DataGroupKind, DataKind, ValidatedPhoneNumber};

use self::{
    address::Address,
    dob::DateOfBirth,
    email::Email,
    name::{FullName, Name},
    ssn::{FullSsn, Ssn},
};

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

pub struct DecomposedDataKind {
    pub data: Vec<(DataKind, PiiString)>,
    pub group: DataGroupKind,
}

impl DecomposedDataKind {
    pub fn simple<P: Into<PiiString>>(kind: DataKind, pii: P) -> Self {
        Self {
            group: kind.group_kind(),
            data: vec![(kind, pii.into())],
        }
    }
}

/// Decompose composite type in to
/// form it needs for db update -- a list of the datakind, value paired with a data
/// group kind
pub trait Decomposable {
    fn decompose(&self) -> DecomposedDataKind;
}

pub struct IdentifyRequest {
    pub first_name: Name,
    pub last_name: Name,
    pub address: Address,
    pub phone: ValidatedPhoneNumber,
    pub dob: DateOfBirth,
    pub email: Email,
    pub ssn: FullSsn,
}

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]

/// Key-value pairs of fields to update for the user_vault
/// (all optional). Patch can be preformed in batch
/// or all at once. *All fields are optional* & do
/// not have to be represented in the request
/// for example {"email_address": "test@test.com"}
/// is a valid UserPatchRequest
/// ssn is either last 4 of ssn or full ssn
pub struct UserPatchRequest {
    pub name: Option<FullName>,
    pub ssn: Option<Ssn>,
    pub dob: Option<DateOfBirth>,
    pub address: Option<Address>,
    pub email: Option<Email>,
}

#[derive(Clone)]
pub struct DataPatchRequest {
    pub data: Vec<(DataKind, PiiString)>,
    pub group_kind: DataGroupKind,
}

impl UserPatchRequest {
    pub fn decompose(&self) -> Vec<DataPatchRequest> {
        let UserPatchRequest {
            name,
            ssn,
            dob,
            address,
            email,
        } = self;

        let all = vec![
            name.clone().map(|n| n.decompose()),
            ssn.clone().map(|ssn| ssn.decompose()),
            dob.clone().map(|dob| dob.decompose()),
            address.clone().map(|addr| addr.decompose()),
            email.clone().map(|email| email.decompose()),
        ];

        all.into_iter()
            .filter_map(|decomposed| {
                decomposed.map(|d| DataPatchRequest {
                    data: d.data,
                    group_kind: d.group,
                })
            })
            .collect()
    }
}
