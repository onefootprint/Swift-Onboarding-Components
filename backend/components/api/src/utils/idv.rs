use super::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use chrono::Utc;
use db::models::{
    identity_data::HasIdentityDataFields,
    verification_request::{NewVerificationRequest, VerificationRequest},
    verification_result::VerificationResult,
};
use newtypes::{DataAttribute, IdvData, ScopedUserId, Vendor};
use std::collections::HashMap;
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
            email: decrypted_values.remove(&DataAttribute::Email),
            phone_number: decrypted_values.remove(&DataAttribute::PhoneNumber),
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
    request: VerificationRequest,
    data: IdvData,
) -> Result<(), ApiError> {
    // TODO spawn a task to do this asynchronously
    match request.vendor {
        Vendor::Idology => {
            let result = state.idology_client.verify_expectid(data).await?;
            state
                .db_pool
                .db_query(|conn| VerificationResult::create(conn, request.id, result))
                .await??;
        }
        _ => return Err(ApiError::NotImplemented),
    }
    Ok(())
}
