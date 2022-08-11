use crate::auth::session_data::user::UserAuthScope;
use crate::auth::{UserAuth, VerifiedUserAuth};
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::email::Email;
use db::models::phone_number::PhoneNumber;
use newtypes::DataPriority;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ApiUserData {
    pub id: String, // TODO
    pub is_verified: bool,
    pub priority: DataPriority,
}

impl From<&Email> for ApiUserData {
    fn from(email: &Email) -> Self {
        Self {
            id: email.id.to_string(),
            is_verified: email.is_verified,
            priority: email.priority,
        }
    }
}

impl From<&PhoneNumber> for ApiUserData {
    fn from(phone_number: &PhoneNumber) -> Self {
        Self {
            id: phone_number.id.to_string(),
            is_verified: phone_number.is_verified,
            priority: phone_number.priority,
        }
    }
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ApiUser {
    pub phone_numbers: Vec<ApiUserData>,
    pub emails: Vec<ApiUserData>,
    // TODO can expand this to include many other data kinds
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
        phone_numbers: uvw.phone_numbers.iter().map(ApiUserData::from).collect(),
        emails: uvw.emails.iter().map(ApiUserData::from).collect(),
    })))
}
