use crate::errors::ApiError;
use crate::utils::fingerprint_builder::FingerprintBuilder;
use crate::State;

use db::models::fingerprint::IsUnique;

use newtypes::address::FullAddressOrZip;
use newtypes::dob::DateOfBirth;
use newtypes::name::FullName;
use newtypes::ssn::Ssn;
use newtypes::{DataAttribute, Fingerprint};

use paperclip::actix::Apiv2Schema;
use serde::Deserialize;

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
    pub address: Option<FullAddressOrZip>,
    // NOTE: don't move this from this position in the struct... Sometimes can break serde???
    #[serde(deserialize_with = "deserialize_flat_option")]
    #[serde(flatten)]
    pub ssn: Option<Ssn>,
}

fn deserialize_flat_option<'de, D, T>(deserializer: D) -> Result<Option<T>, D::Error>
where
    D: serde::Deserializer<'de>,
    T: serde::Deserialize<'de>,
{
    // For a flattened Option<T>, if the value is Some(_) but an error occurs deserializing T,
    // serde coerces this into Ok(None) rather than Err(_).
    // This custom implementation makes sure that we bubble up an error parsing T
    let v = Option::<serde_json::Value>::deserialize(deserializer)?;
    println!("deserializing blah value {:?}", v);
    let value = match v {
        Some(v) => Some(T::deserialize(v).map_err(serde::de::Error::custom)?),
        None => None,
    };
    Ok(value)
}

pub type ComputedFingerprints = Vec<(DataAttribute, Fingerprint, IsUnique)>;
impl IdentityDataRequest {
    pub async fn fingerprints(&self, state: &State) -> Result<ComputedFingerprints, ApiError> {
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
