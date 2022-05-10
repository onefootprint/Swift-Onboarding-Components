use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::client_secret_key::SecretTenantAuthContext, errors::ApiError};
use db::models::user_vaults::UserVault;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::{HashMap, HashSet};
use strum_macros::{self, Display};

#[derive(
    Debug,
    Clone,
    Apiv2Schema,
    serde::Deserialize,
    serde::Serialize,
    Eq,
    PartialEq,
    Hash,
    Ord,
    PartialOrd,
    Display,
)]
#[serde(rename_all = "snake_case")]
pub enum UserVaultField {
    FirstName,
    LastName,
    Ssn,
    Dob,
    StreetAddress,
    City,
    State,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    footprint_user_id: String,
    attributes: HashSet<UserVaultField>,
}
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptResponse {
    pub attributes: HashMap<UserVaultField, String>,
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

    // look up tenant & user vualt
    let user_vault: Option<UserVault> = db::user_vault::get_by_tenant_and_onboarding(
        &state.db_pool,
        tenant.id.clone(),
        request.footprint_user_id.clone(),
    )
    .await?;

    let map = match user_vault {
        None => Err(ApiError::InvalidTenantKeyOrUserId),
        Some(vault) => {
            let mut map = HashMap::new();
            for attr in request.attributes.clone() {
                let val = decrypt_field(&state, attr.clone(), vault.clone()).await?;
                map.insert(attr, val);
            }
            Ok(map)
        }
    }?;

    Ok(Json(ApiResponseData {
        data: UserDecryptResponse { attributes: map },
    }))
}

async fn decrypt_field(
    state: &web::Data<State>,
    attr: UserVaultField,
    vault: UserVault,
) -> Result<String, ApiError> {
    let val = match attr {
        UserVaultField::FirstName => vault.e_first_name,
        UserVaultField::LastName => vault.e_last_name,
        UserVaultField::Ssn => vault.e_ssn,
        UserVaultField::Dob => vault.e_dob,
        UserVaultField::StreetAddress => vault.e_street_address,
        UserVaultField::City => vault.e_city,
        UserVaultField::State => vault.e_state,
    };
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
