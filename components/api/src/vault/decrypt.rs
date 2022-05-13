use crate::response::success::ApiResponseData;
use crate::vault::types::UserVaultFieldKind;
use crate::State;
use crate::{auth::client_secret_key::SecretTenantAuthContext, errors::ApiError};
use db::models::access_events::NewAccessEvent;
use db::models::user_vaults::UserVault;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    footprint_user_id: String,
    attributes: HashSet<UserVaultFieldKind>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptResponse {
    pub attributes: HashMap<UserVaultFieldKind, String>,
}

#[api_v2_operation]
#[post("/decrypt")]
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
    // TODO create batch enclave decrypt operation since RTT is ~100ms
    for attr in request.attributes.clone() {
        let val = decrypt_field(&state, attr.clone(), vault.clone(), onboarding.id.clone()).await?;
        map.insert(attr, val);
    }

    Ok(Json(ApiResponseData {
        data: UserDecryptResponse { attributes: map },
    }))
}

async fn decrypt_field(
    state: &web::Data<State>,
    field_kind: UserVaultFieldKind,
    vault: UserVault,
    onboarding_id: String,
) -> Result<String, ApiError> {
    let val = match field_kind {
        UserVaultFieldKind::FirstName => vault.e_first_name,
        UserVaultFieldKind::LastName => vault.e_last_name,
        UserVaultFieldKind::Ssn => vault.e_ssn,
        UserVaultFieldKind::Dob => vault.e_dob,
        UserVaultFieldKind::StreetAddress => vault.e_street_address,
        UserVaultFieldKind::City => vault.e_city,
        UserVaultFieldKind::State => vault.e_state,
        UserVaultFieldKind::Email => vault.e_email,
        UserVaultFieldKind::PhoneNumber => Some(vault.e_phone_number),
    };
    // Create an AccessEvent log showing that the tenant accessed the vault
    NewAccessEvent {
        onboarding_id,
        data_kind: field_kind.into(),
    }
    .save(&state.db_pool)
    .await?;
    decrypt_vault_value(state, val, vault.e_private_key.clone()).await
}

async fn decrypt_vault_value(
    state: &web::Data<State>,
    value: Option<Vec<u8>>,
    private_key: Vec<u8>,
) -> Result<String, ApiError> {
    let val = value.unwrap_or_default();
    let decrypted = crate::enclave::lib::decrypt_bytes(
        state,
        &val,
        private_key,
        enclave_proxy::DataTransform::Identity,
    )
    .await?;
    Ok(std::str::from_utf8(&decrypted)?.to_string())
}
