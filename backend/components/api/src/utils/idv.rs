use super::{user_vault_wrapper::UserVaultWrapper, verification::get_reason_codes};
use crate::{errors::ApiError, State};
use chrono::Utc;
use db::models::{
    identity_data::HasIdentityDataFields,
    onboarding::Onboarding,
    verification_request::{NewVerificationRequest, VerificationRequest},
    verification_result::VerificationResult,
};
use newtypes::{
    email::Email, DataAttribute, IdvData, OnboardingId, PhoneNumber, ScopedUserId, Status, Vendor,
};
use std::{collections::HashMap, str::FromStr};
use strum::IntoEnumIterator;

impl UserVaultWrapper {
    #[allow(unused)]
    pub async fn build_idv_request(&self, state: &State) -> Result<IdvData, ApiError> {
        let (keys, encrypted_values): (Vec<_>, Vec<_>) = DataAttribute::iter()
            .flat_map(|a| self.get_e_field(a).map(|v| (a, v)))
            .unzip();
        let decrypted_values = self.decrypt(state, encrypted_values).await?;
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
        &self,
        scoped_user_id: ScopedUserId,
        vendor: Vendor,
    ) -> NewVerificationRequest {
        NewVerificationRequest {
            scoped_user_id,
            vendor,
            timestamp: Utc::now(),
            email_id: self.email.as_ref().map(|e| e.id.clone()),
            phone_number_id: self.phone_number.as_ref().map(|e| e.id.clone()),
            identity_data_id: self.identity_data.as_ref().map(|e| e.id.clone()),
        }
    }
}

pub async fn initiate_idv_request(
    state: &State,
    onboarding_id: OnboardingId,
    request: VerificationRequest,
    data: IdvData,
) -> Result<(), ApiError> {
    // TODO spawn a task to do this asynchronously
    let result = match request.vendor {
        Vendor::Idology => state.idology_client.verify_expectid(data).await?,
        _ => return Err(ApiError::NotImplemented),
    };
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let result = VerificationResult::create(conn, request.id, result)?;
            // TODO handle errors
            let reason_codes = get_reason_codes(request.vendor, result)?;
            // TODO more advanced decision engine... lol
            // Some reason codes may not prevent us from marking the onboarding as verified either
            // TODO create audit trails
            let new_status = if reason_codes.is_empty() {
                Status::Verified
            } else {
                Status::ManualReview
            };
            Onboarding::update_status_by_id(conn, &onboarding_id, new_status)?;
            Ok(())
        })
        .await?;
    Ok(())
}
