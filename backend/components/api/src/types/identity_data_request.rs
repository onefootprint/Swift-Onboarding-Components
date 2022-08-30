use crate::errors::user::UserError;
use crate::errors::ApiError;
use crate::utils::fingerprint_builder::FingerprintBuilder;
use crate::State;

use db::models::fingerprint::IsUnique;

use newtypes::address::{Address, FullAddressOrZip, ZipAndCountry};
use newtypes::dob::DateOfBirth;
use newtypes::name::FullName;
use newtypes::ssn::{Ssn, Ssn4, Ssn9};
use newtypes::{DataAttribute, Fingerprint};

use paperclip::actix::Apiv2Schema;

/// Post user identity data
#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct IdentityDataRequest {
    pub name: Option<FullName>,
    pub dob: Option<DateOfBirth>,
    pub address: Option<Address>,
    pub zip_address: Option<ZipAndCountry>,
    pub ssn9: Option<Ssn9>,
    pub ssn4: Option<Ssn4>,
    #[serde(default)]
    pub speculative: bool,
}

impl TryFrom<IdentityDataRequest> for IdentityDataUpdate {
    type Error = ApiError;
    fn try_from(r: IdentityDataRequest) -> Result<Self, Self::Error> {
        let IdentityDataRequest { name, dob, .. } = r;
        let ssn = match (r.ssn9, r.ssn4) {
            (Some(_), Some(_)) => return Err(UserError::InvalidIdentityDataUpdate.into()),
            (Some(ssn9), None) => Some(Ssn::Ssn9(ssn9)),
            (None, Some(ssn4)) => Some(Ssn::Ssn4(ssn4)),
            (None, None) => None,
        };
        let address = match (r.address, r.zip_address) {
            (Some(_), Some(_)) => return Err(UserError::InvalidIdentityDataUpdate.into()),
            (Some(full_address), None) => Some(FullAddressOrZip::Address(full_address)),
            (None, Some(zip_and_country)) => Some(FullAddressOrZip::ZipAndCountry(zip_and_country)),
            (None, None) => None,
        };
        let result = Self {
            name,
            dob,
            address,
            ssn,
        };
        Ok(result)
    }
}

#[derive(Debug, Clone)]
pub struct IdentityDataUpdate {
    pub name: Option<FullName>,
    pub dob: Option<DateOfBirth>,
    pub address: Option<FullAddressOrZip>,
    pub ssn: Option<Ssn>,
}

pub type ComputedFingerprints = Vec<(DataAttribute, Fingerprint, IsUnique)>;
impl IdentityDataUpdate {
    pub async fn fingerprints(&self, state: &State) -> Result<ComputedFingerprints, ApiError> {
        let mut builder = FingerprintBuilder::new();

        let IdentityDataUpdate {
            name,
            dob,
            ssn,
            address,
        } = self.clone();

        if let Some(name) = name {
            builder.add_full_name(name);
        }

        if let Some(dob) = dob {
            builder.add(dob.into(), DataAttribute::Dob);
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
