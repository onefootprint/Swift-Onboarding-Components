use crate::{errors::ApiError, State};
use db::models::user_vaults::UserVault;
use newtypes::address::Address;
use newtypes::dob::DateOfBirth;
use newtypes::email::Email;
use newtypes::name::FullName;
use newtypes::ssn::Ssn;
use newtypes::DataKind;
use newtypes::Decomposable;
use newtypes::Fingerprinter;
use newtypes::NewData;
use newtypes::NewSealedData;
use paperclip::actix::Apiv2Schema;
use std::collections::HashMap;

/// Key-value pairs of fields to update for the user_vault
/// (all optional). Patch can be preformed in batch
/// or all at once. *All fields are optional* & do
/// not have to be represented in the request
/// for example {"email_address": "test@test.com"}
/// is a valid UserPatchRequest
/// ssn is either last 4 of ssn or full ssn
#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct UserPatchRequest {
    pub name: Option<FullName>,
    pub ssn: Option<Ssn>,
    pub dob: Option<DateOfBirth>,
    pub address: Option<Address>,
    pub email: Option<Email>,
    #[serde(default)]
    pub speculative: bool,
}

impl UserPatchRequest {
    pub async fn decompose_and_seal(
        self,
        state: &State,
        user_vault: &UserVault,
    ) -> Result<HashMap<DataKind, NewSealedData>, ApiError> {
        let UserPatchRequest {
            name,
            ssn,
            dob,
            address,
            email,
            speculative: _,
        } = self;

        let results = vec![
            name.map(|n| n.decompose()),
            ssn.map(|ssn| ssn.decompose()),
            dob.map(|dob| dob.decompose()),
            address.map(|addr| addr.decompose()),
            email.map(|email| email.decompose()),
        ]
        .into_iter()
        .flatten()
        .flatten()
        .collect::<Vec<NewData>>();

        let mut new_data = HashMap::<DataKind, NewSealedData>::new();
        for NewData { data_kind, data } in results {
            // Compute the fingerprint and seal the data
            let sh_data = if data_kind.allows_fingerprint() {
                Some(state.compute_fingerprint(data_kind, &data).await?)
            } else {
                None
            };
            let e_data = user_vault.public_key.seal_pii(&data)?;
            new_data.insert(data_kind, NewSealedData { e_data, sh_data });
        }
        Ok(new_data)
    }
}
