use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use crate::{
    auth::logged_in_session::LoggedInSessionContext, utils::user_vault_wrapper::UserVaultWrapper,
};
use db::models::user_vaults::UserVault;
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ApiUser {
    first_name: Option<String>,
    last_name: Option<String>,
    // TODO could include some other fields here by default
}

async fn decrypt_field(
    state: &web::Data<State>,
    e_data: Option<&[u8]>,
    e_private_key: Vec<u8>,
) -> Result<Option<String>, ApiError> {
    if let Some(e_data) = e_data {
        let decrypted_data = crate::enclave::decrypt_bytes(
            state,
            e_data,
            e_private_key,
            enclave_proxy::DataTransform::Identity,
        )
        .await?;
        Ok(Some(decrypted_data))
    } else {
        Ok(None)
    }
}

impl ApiUser {
    async fn from(uv: &UserVault, state: &web::Data<State>) -> Result<Self, ApiError> {
        let uvw = UserVaultWrapper::from(&state.db_pool, uv.clone()).await?;
        let api_user = Self {
            first_name: decrypt_field(
                state,
                uvw.get_e_field(DataKind::FirstName),
                uv.e_private_key.clone(),
            )
            .await?,
            last_name: decrypt_field(
                state,
                uvw.get_e_field(DataKind::LastName),
                uv.e_private_key.clone(),
            )
            .await?,
        };
        Ok(api_user)
    }
}

#[api_v2_operation(tags(User))]
/// Returns a decrypted profile for the logged-in user.
/// Requires user authentication sent in the cookie after a successful /identify/verify call
pub async fn handler(
    user_auth: LoggedInSessionContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<ApiUser>>, ApiError> {
    let existing_user = user_auth.user_vault();
    Ok(Json(ApiResponseData {
        data: ApiUser::from(existing_user, &state).await?,
    }))
}
