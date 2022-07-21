use crate::auth::session_context::HasUserVaultId;
use crate::auth::session_data::user::my_fp::My1fpBasicSession;
use crate::types::success::ApiResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use crate::{auth::session_context::SessionContext, errors::ApiError};
use db::models::user_data::UserData;
use newtypes::{DataKind, UserDataId};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ApiUserEmail {
    pub id: UserDataId,
    pub is_verified: bool,
}

impl From<&UserData> for ApiUserEmail {
    fn from(data: &UserData) -> Self {
        Self {
            id: data.id.clone(),
            is_verified: data.is_verified,
        }
    }
}

pub type EmailListResponse = Vec<ApiUserEmail>;

#[api_v2_operation(tags(User))]
/// Returns a decrypted profile for the logged-in user
/// Requires user authentication sent in the cookie after a successful /identify/verify call
pub async fn get(
    user_auth: SessionContext<My1fpBasicSession>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<EmailListResponse>>, ApiError> {
    let existing_user = user_auth.user_vault(&state.db_pool).await?;
    let uvw = UserVaultWrapper::from(&state.db_pool, existing_user).await?;
    let emails = uvw.get_data(DataKind::Email);
    Ok(Json(ApiResponseData::ok(
        emails.into_iter().map(ApiUserEmail::from).collect(),
    )))
}
