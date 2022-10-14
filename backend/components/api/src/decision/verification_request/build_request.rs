use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use chrono::Utc;
use db::models::{identity_data::HasIdentityDataFields, verification_request::NewVerificationRequest};
use newtypes::{email::Email, DataAttribute, IdvData, OnboardingId, PhoneNumber, Vendor};
use std::{collections::HashMap, str::FromStr};
use strum::IntoEnumIterator;

pub(super) async fn build_idv_data(uvw: &UserVaultWrapper, state: &State) -> Result<IdvData, ApiError> {
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
        ssn4: decrypted_values.remove(&DataAttribute::Ssn4),
        ssn9: decrypted_values.remove(&DataAttribute::Ssn9),
        dob: decrypted_values.remove(&DataAttribute::Dob),
        email,
        phone_number,
    };
    Ok(request)
}

pub fn build_verification_request(
    uvw: &UserVaultWrapper,
    ob_id: OnboardingId,
    vendor: Vendor,
) -> NewVerificationRequest {
    NewVerificationRequest {
        onboarding_id: ob_id,
        vendor,
        timestamp: Utc::now(),
        email_id: uvw.email.as_ref().map(|e| e.id.clone()),
        phone_number_id: uvw.phone_number.as_ref().map(|e| e.id.clone()),
        identity_data_id: uvw.identity_data.as_ref().map(|e| e.id.clone()),
        identity_document_id: None,
    }
}
