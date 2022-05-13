use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::errors::ApiError;
use crate::response::success::ApiResponseData;
use crate::State;
use db::models::user_vaults::UserVault;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ApiUser {
    first_name: Option<String>,
    last_name: Option<String>,
    // TODO could include some other fields here by default
}

async fn decrypt_field(
    state: &web::Data<State>,
    e_data: &Option<Vec<u8>>,
    e_private_key: Vec<u8>,
) -> Result<Option<String>, ApiError> {
    if let Some(e_data) = e_data {
        let decrypted_data = crate::enclave::lib::decrypt_bytes(
            state,
            e_data,
            e_private_key,
            enclave_proxy::DataTransform::Identity,
        )
        .await?;
        let decoded_data = std::str::from_utf8(&decrypted_data)?.to_string();
        Ok(Some(decoded_data))
    } else {
        Ok(None)
    }
}

impl ApiUser {
    async fn from(uv: &UserVault, state: &web::Data<State>) -> Result<Self, ApiError> {
        let api_user = Self {
            first_name: decrypt_field(state, &uv.e_first_name, uv.e_private_key.clone()).await?,
            last_name: decrypt_field(state, &uv.e_last_name, uv.e_private_key.clone()).await?,
        };
        Ok(api_user)
    }
}

#[api_v2_operation]
/// Issues a text message challenge to an existing user, identified by either phone number or email.
pub async fn handler(
    user_auth: LoggedInSessionContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<ApiUser>>, ApiError> {
    let existing_user = user_auth.user_vault();
    Ok(Json(ApiResponseData {
        data: ApiUser::from(existing_user, &state).await?,
    }))
}
