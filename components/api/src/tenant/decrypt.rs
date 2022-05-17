use crate::types::success::ApiResponseData;
use crate::State;
use crate::{auth::client_secret_key::SecretTenantAuthContext, errors::ApiError};
use db::models::access_events::NewAccessEvent;
use db::models::user_vaults::UserVault;
use newtypes::{DataKind, FootprintUserId};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    footprint_user_id: FootprintUserId,
    attributes: HashSet<DataKind>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptResponse {
    pub attributes: HashMap<DataKind, Option<String>>,
}

#[api_v2_operation]
#[post("/decrypt")]
/// Allows a tenant to decrypt a specific user's data. The user requested must be onboarded onto
/// the requesting tenant.
/// Requires tenant secret key auth.
fn handler(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    // grab tenant secret key from header
    let tenant = auth.tenant();

    // look up tenant & user vault
    let (vault, onboarding) = db::user_vault::get_by_tenant_and_onboarding(
        &state.db_pool,
        tenant.id.clone(),
        request.footprint_user_id.clone(),
    )
    .await?
    .ok_or(ApiError::InvalidTenantKeyOrUserId)?;

    let mut map = HashMap::new();
    for attr in &request.attributes {
        let val = decrypt_field(&state, attr, vault.clone()).await?;
        map.insert(attr.to_owned(), val);

        // Create an AccessEvent log showing that the tenant accessed the vault
        NewAccessEvent {
            onboarding_id: onboarding.id.clone(),
            data_kind: attr.to_owned(),
        }
        .save(&state.db_pool)
        .await?;
    }

    Ok(Json(ApiResponseData {
        data: UserDecryptResponse { attributes: map },
    }))
}

// TODO create batch enclave decrypt operation since RTT is ~100ms
pub async fn decrypt_field(
    state: &web::Data<State>,
    field_kind: &DataKind,
    vault: UserVault,
) -> Result<Option<String>, ApiError> {
    let value = match field_kind {
        DataKind::FirstName => vault.e_first_name,
        DataKind::LastName => vault.e_last_name,
        DataKind::Ssn => vault.e_ssn,
        DataKind::Dob => vault.e_dob,
        DataKind::StreetAddress => vault.e_street_address,
        DataKind::City => vault.e_city,
        DataKind::State => vault.e_state,
        DataKind::Email => vault.e_email,
        DataKind::PhoneNumber => Some(vault.e_phone_number),
    };
    if let Some(value) = value {
        let decrypted = crate::enclave::lib::decrypt_bytes(
            state,
            &value,
            vault.e_private_key,
            enclave_proxy::DataTransform::Identity,
        )
        .await?;
        Ok(Some(decrypted))
    } else {
        Ok(None)
    }
}
