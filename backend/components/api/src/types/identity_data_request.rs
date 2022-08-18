use crate::errors::ApiError;
use crate::utils::fingerprint_builder::FingerprintBuilder;
use crate::State;

use db::models::fingerprint::IsUnique;

use newtypes::address::FullAddressOrZip;
use newtypes::dob::DateOfBirth;
use newtypes::name::FullName;
use newtypes::ssn::Ssn;
use newtypes::{DataKind, Fingerprint};

use paperclip::actix::Apiv2Schema;

/// Post user identity data
#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct IdentityDataRequest {
    #[serde(flatten)]
    pub update: IdentityDataUpdate,
    #[serde(default)]
    pub speculative: bool,
}

#[derive(Debug, Clone, serde::Deserialize, serde:: Serialize, Apiv2Schema)]
pub struct IdentityDataUpdate {
    pub name: Option<FullName>,
    pub dob: Option<DateOfBirth>,
    #[serde(flatten)]
    pub ssn: Option<Ssn>,
    #[serde(flatten)]
    pub address: Option<FullAddressOrZip>,
}

impl IdentityDataRequest {
    pub async fn fingerprints(
        &self,
        state: &State,
    ) -> Result<Vec<(DataKind, Fingerprint, IsUnique)>, ApiError> {
        let mut builder = FingerprintBuilder::new();

        let IdentityDataUpdate {
            name,
            dob,
            ssn,
            address,
        } = self.update.clone();

        if let Some(name) = name {
            builder.add_full_name(name);
        }

        if let Some(dob) = dob {
            builder.add(dob.into(), DataKind::Dob);
        }

        if let Some(ssn) = ssn {
            builder.add_ssn(ssn);
        }

        if let Some(address) = address {
            builder.add_address_or_zip(address);
        }

        builder.create(state).await
    }
}
