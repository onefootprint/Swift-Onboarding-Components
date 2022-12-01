use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use db::models::verification_request::VerificationRequest;
use db::HasDataAttributeFields;
use newtypes::{email::Email, DataAttribute, IdvData, PhoneNumber};
use std::{collections::HashMap, str::FromStr};
use strum::IntoEnumIterator;

pub async fn build_idv_data_from_verification_request(
    state: &State,
    request: VerificationRequest,
) -> Result<IdvData, ApiError> {
    // Build the set of data we will send to the vendor by re-building the UVW from the DB using
    // the pointers to pieces of user data saved on the VerificationRequest
    // This is unnecessary right now, but will allow us to re-run this logic when this task is async
    let uvw = state
        .db_pool
        .db_query(|conn| UserVaultWrapper::from_verification_request(conn, request))
        .await??;

    let (keys, encrypted_values): (Vec<_>, Vec<_>) = DataAttribute::iter()
        .flat_map(|a| uvw.get_e_field(a).map(|v| (a, v)))
        .unzip();
    let decrypted_values = uvw.decrypt(state, encrypted_values).await?;
    let mut decrypted_values: HashMap<DataAttribute, _> =
        keys.into_iter().zip(decrypted_values.into_iter()).collect();
    // Remove sandbox suffixes
    let email = decrypted_values
        .remove(&DataAttribute::Email)
        .map(|x| Email::from_str(x.leak()).map(|x| x.email))
        .transpose()?;
    let phone_number = decrypted_values
        .remove(&DataAttribute::PhoneNumber)
        .map(|x| PhoneNumber::from_str(x.leak()).map(|x| x.number))
        .transpose()?;
    let request = IdvData {
        first_name: decrypted_values.remove(&DataAttribute::FirstName),
        last_name: decrypted_values.remove(&DataAttribute::LastName),
        address_line1: decrypted_values.remove(&DataAttribute::AddressLine1),
        address_line2: decrypted_values.remove(&DataAttribute::AddressLine2),
        city: decrypted_values.remove(&DataAttribute::City),
        state: decrypted_values.remove(&DataAttribute::State),
        zip: decrypted_values.remove(&DataAttribute::Zip),
        country: decrypted_values.remove(&DataAttribute::Country),
        ssn4: decrypted_values.remove(&DataAttribute::Ssn4),
        ssn9: decrypted_values.remove(&DataAttribute::Ssn9),
        dob: decrypted_values.remove(&DataAttribute::Dob),
        email,
        phone_number,
    };
    Ok(request)
}
