use derive_more::Display;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

use crate::{DataIdentifier, FpId};

#[derive(
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Display,
    Hash,
    Clone,
    Copy,
    AsRefStr,
    Deserialize,
    Serialize,
    EnumString,
    Apiv2Schema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum DupeKind {
    Ssn9,
    Email,
    PhoneNumber,
}

#[derive(Debug, Clone, Default, Eq, PartialEq, Deserialize, Serialize, Apiv2Schema)]
pub struct Dupes {
    pub same_tenant: Vec<SameTenantDupe>,
    pub other_tenant: OtherTenantDupes,
}

#[derive(Debug, Clone, Default, Eq, PartialEq, Deserialize, Serialize, Apiv2Schema)]
pub struct SameTenantDupe {
    pub fp_id: FpId,
    pub dupe_kinds: Vec<DupeKind>,
    // TODO: more fields
    // pub status: OnboardingStatus,
    // pub created: DateTime<Utc>,
    // pub name: PiiString, // hmm where to do this decryption?
}

#[derive(Debug, Clone, Default, Eq, PartialEq, Deserialize, Serialize, Apiv2Schema)]
pub struct OtherTenantDupes {
    pub num_matches: usize, // number of distinct vaults that (1) have any sort of dupe match and (2) have not onboarded onto the same tenant as the the scoped_vault for which dupes are being queried for
    pub num_tenants: usize, // number of distinct tenants from the vaults described above ^
}

impl TryFrom<DataIdentifier> for DupeKind {
    type Error = crate::Error;

    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Id(idk) => match idk {
                crate::IdentityDataKind::Ssn9 => Ok(Self::Ssn9),
                crate::IdentityDataKind::Email => Ok(Self::Email),
                crate::IdentityDataKind::PhoneNumber => Ok(Self::PhoneNumber),
                _ => Err(crate::Error::Custom(
                    format!("Can't convert {} into DupeKind", value).to_owned(),
                )),
            },
            _ => Err(crate::Error::Custom(
                format!("Can't convert {} into DupeKind", value).to_owned(),
            )),
        }
    }
}
