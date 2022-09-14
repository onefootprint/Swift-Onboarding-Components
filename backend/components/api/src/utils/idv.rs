use super::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use chrono::Utc;
use db::models::{
    audit_trail::AuditTrail,
    identity_data::HasIdentityDataFields,
    onboarding::Onboarding,
    verification_request::{NewVerificationRequest, VerificationRequest},
    verification_result::VerificationResult,
};
use idv::IdvResponse;
use newtypes::{
    email::Email, AuditTrailEvent, DataAttribute, IdvData, OnboardingId, PhoneNumber, Status, TenantId,
    UserVaultId, Vendor, VerificationInfo,
};
use std::{collections::HashMap, str::FromStr};
use strum::IntoEnumIterator;

impl UserVaultWrapper {
    pub async fn build_idv_data(&self, state: &State) -> Result<IdvData, ApiError> {
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

    pub fn build_verification_request(&self, ob_id: OnboardingId, vendor: Vendor) -> NewVerificationRequest {
        NewVerificationRequest {
            onboarding_id: ob_id,
            vendor,
            timestamp: Utc::now(),
            email_id: self.email.as_ref().map(|e| e.id.clone()),
            phone_number_id: self.phone_number.as_ref().map(|e| e.id.clone()),
            identity_data_id: self.identity_data.as_ref().map(|e| e.id.clone()),
        }
    }
}

pub async fn initiate_idv_requests(
    state: &State,
    ob_id: OnboardingId,
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
    requests: Vec<VerificationRequest>,
) -> Result<(), ApiError> {
    // TODO spawn a task to do this asynchronously
    let fut_requests = requests
        .into_iter()
        .map(|r| process_idv_request(state, user_vault_id.clone(), tenant_id.clone(), r));
    let result_statuses = futures::future::try_join_all(fut_requests).await?;
    save_final_result(state, ob_id, result_statuses).await?;
    Ok(())
}

async fn save_final_result(
    state: &State,
    ob_id: OnboardingId,
    result_statuses: Vec<Option<Status>>,
) -> Result<(), ApiError> {
    // TODO build process to run this asynchronously if we crashed before getting here
    let final_status = result_statuses
        .into_iter()
        .flatten()
        .min()
        .unwrap_or(Status::Failed);
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            Onboarding::update_status_by_id(conn, &ob_id, final_status)?;
            if let Some(status) = final_status.audit_status() {
                let (_, scoped_user) = Onboarding::get(conn, &ob_id)?;
                AuditTrail::create(
                    conn,
                    AuditTrailEvent::Verification(VerificationInfo {
                        attributes: vec![],
                        vendor: Vendor::Footprint,
                        status,
                    }),
                    scoped_user.user_vault_id,
                    Some(scoped_user.tenant_id),
                    None,
                )?;
            }
            Ok(())
        })
        .await?;
    Ok(())
}

async fn process_idv_request(
    state: &State,
    user_vault_id: UserVaultId,
    tenant_id: TenantId,
    request: VerificationRequest,
) -> Result<Option<Status>, ApiError> {
    let request_id = request.id.clone();
    let IdvResponse {
        status,
        audit_events,
        raw_response,
    } = send_idv_request(state, request).await?;

    // Atomically create the VerificationResult row, update the status of the onboarding, and
    // create new audit trails
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let result = VerificationResult::create(conn, request_id, raw_response)?;
            audit_events.into_iter().try_for_each(|e| {
                AuditTrail::create(
                    conn,
                    e,
                    user_vault_id.clone(),
                    Some(tenant_id.clone()),
                    Some(result.id.clone()),
                )
            })?;
            Ok(())
        })
        .await?;
    Ok(status)
}

async fn send_idv_request(state: &State, request: VerificationRequest) -> Result<IdvResponse, ApiError> {
    // Build the set of data we will send to the vendor by re-building the UVW from the DB using
    // the pointers to pieces of user data saved on the VerificationRequest
    // This is unnecessary right now, but will allow us to re-run this logic when this task is async
    let vendor = request.vendor;
    let uvw = state
        .db_pool
        .db_query(|conn| UserVaultWrapper::from_verification_request(conn, request))
        .await??;
    let data_to_verify = uvw.build_idv_data(state).await?;

    // Make the request to the IDV vendor
    let result = match vendor {
        Vendor::Idology => {
            let (raw_response, signal_scopes) = state
                .idology_client
                .verify_expectid(data_to_verify)
                .await
                .map_err(idv::Error::from)?;
            idv::idology::verification::process(raw_response, signal_scopes).map_err(idv::Error::from)?
        }
        Vendor::Twilio => {
            // TODO make it easier to share twilio client between IDV + SMS sending
            idv::twilio::lookup_v2(&state.twilio_client.client, data_to_verify)
                .await
                .map_err(idv::Error::from)?
        }
        _ => return Err(ApiError::NotImplemented),
    };

    // Process the response from the IDV vendor
    Ok(result)
}
