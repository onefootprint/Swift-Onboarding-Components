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
use idv::verification::get_signals;
use newtypes::{
    email::Email, AuditTrailEvent, DataAttribute, IdvData, OnboardingId, PhoneNumber, ScopedUserId, Signal,
    SignalAttribute, SignalKind, Status, TenantId, UserVaultId, Vendor, VerificationInfo,
    VerificationInfoStatus,
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

pub struct IdvRequestData {
    pub onboarding_id: OnboardingId,
    pub user_vault_id: UserVaultId,
    pub tenant_id: TenantId,
    pub request: VerificationRequest,
    pub uvw: UserVaultWrapper,
}

pub async fn initiate_idv_request(state: &State, data: IdvRequestData) -> Result<(), ApiError> {
    // TODO spawn a task to do this asynchronously
    let IdvRequestData {
        onboarding_id,
        user_vault_id,
        tenant_id,
        request,
        uvw,
    } = data;
    let idv_data = uvw.build_idv_request(state).await?;

    let (result, pending_attributes) = match request.vendor {
        Vendor::Idology => state
            .idology_client
            .verify_expectid(idv_data)
            .await
            .map_err(idv::Error::from)?,
        _ => return Err(ApiError::NotImplemented),
    };
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let result = VerificationResult::create(conn, request.id, result)?;
            let result_id = result.id.clone();
            let (new_status, events) = match get_signals(request.vendor, result.response) {
                Ok(signals) => process_success(signals, request.vendor, pending_attributes)?,
                Err(_) => process_error()?,
            };
            Onboarding::update_status_by_id(conn, &onboarding_id, new_status)?;
            events.into_iter().try_for_each(|e| {
                AuditTrail::create(
                    conn,
                    AuditTrailEvent::Verification(e),
                    user_vault_id.clone(),
                    Some(tenant_id.clone()),
                    Some(result_id.clone()),
                )
            })?;
            Ok(())
        })
        .await?;
    Ok(())
}

fn process_success(
    signals: Vec<Signal>,
    vendor: Vendor,
    pending_attributes: Vec<SignalAttribute>,
) -> Result<(Status, Vec<VerificationInfo>), ApiError> {
    // Create a map of SignalAttribute -> Vec<SignalKind>
    let mut attribute_to_signals = HashMap::<SignalAttribute, Vec<_>>::new();
    for signal in signals {
        for attr in signal.attributes {
            let signals_for_attr = attribute_to_signals.entry(attr).or_default();
            signals_for_attr.push(signal.kind);
        }
    }
    // Look at the maximum signal for each attribute. If it is more severe than INFO, we shouldn't
    // include the field in the list of verified attributes in the audit log
    // Note that there may be attributes in failed_attributes that aren't included in pending_attributes.
    let failed_attributes: Vec<_> = attribute_to_signals
        .into_iter()
        .filter_map(|(attr, signal_kinds)| {
            let max_signal = signal_kinds.into_iter().max()?;
            if max_signal <= SignalKind::Info {
                // If we have a TODO, NotImportant, or Info signal on this piece of data, treat it as nothing
                None
            } else {
                // If we have a NotFound, InvalidRequest, Alert, or Fraud signal on this piece of data, fail (for now)
                Some(attr)
            }
        })
        .collect();
    let verified_fields: Vec<_> = pending_attributes
        .into_iter()
        .filter(|a| !failed_attributes.contains(a))
        .collect();

    // TODO more advanced decision engine than just failing if there's info for any piece of data
    let (new_status, final_audit_status) = if failed_attributes.is_empty() {
        (Status::Verified, VerificationInfoStatus::Verified)
    } else {
        (Status::ManualReview, VerificationInfoStatus::Failed)
    };
    let events = vec![
        (!verified_fields.is_empty()).then_some(VerificationInfo {
            attributes: verified_fields,
            vendor,
            status: VerificationInfoStatus::Verified,
        }),
        (!failed_attributes.is_empty()).then_some(VerificationInfo {
            attributes: failed_attributes,
            vendor,
            status: VerificationInfoStatus::Failed,
        }),
        Some(VerificationInfo {
            attributes: vec![],
            vendor: Vendor::Footprint,
            status: final_audit_status,
        }),
    ]
    .into_iter()
    .flatten()
    .collect();
    Ok((new_status, events))
}

fn process_error() -> Result<(Status, Vec<VerificationInfo>), ApiError> {
    let events = vec![VerificationInfo {
        attributes: vec![],
        vendor: Vendor::Footprint,
        status: VerificationInfoStatus::Failed,
    }];
    Ok((Status::ManualReview, events))
}
