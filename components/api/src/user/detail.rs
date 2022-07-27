use crate::auth::session_data::user::UserAuthScope;
use crate::auth::{session_context::HasUserVaultId, UserAuth};
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::user_data::UserData;
use newtypes::{DataKind, DataPriority, UserDataId};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ApiUserData {
    pub id: UserDataId,
    pub is_verified: bool,
    pub priority: DataPriority,
}

impl From<&UserData> for ApiUserData {
    fn from(data: &UserData) -> Self {
        Self {
            id: data.id.clone(),
            is_verified: data.is_verified,
            priority: data.data_group_priority,
        }
    }
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ApiUser {
    pub phone_numbers: Vec<ApiUserData>,
    pub emails: Vec<ApiUserData>,
    // TODO can expand this to include many other data kinds
}

fn get_data(uvw: &UserVaultWrapper, data_kind: DataKind) -> Vec<ApiUserData> {
    uvw.get_data(data_kind)
        .into_iter()
        .map(ApiUserData::from)
        .collect()
}

#[api_v2_operation(tags(User))]
/// Returns a decrypted profile for the logged-in user
/// Requires user authentication sent in the cookie after a successful /identify/verify call
pub async fn handler(
    user_auth: UserAuth,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<ApiUser>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    let existing_user = user_auth.user_vault(&state.db_pool).await?;
    let uvw = UserVaultWrapper::from(&state.db_pool, existing_user).await?;
    Ok(Json(ApiResponseData::ok(ApiUser {
        phone_numbers: get_data(&uvw, DataKind::PhoneNumber),
        emails: get_data(&uvw, DataKind::Email),
    })))
}
