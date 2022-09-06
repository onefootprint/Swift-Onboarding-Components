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

#[api_v2_operation(
    summary = "/hosted/user/detail",
    tags(Hosted),
    description = "Returns a decrypted profile for the logged-in user. Requires user authentication \
    from a successful /identify/verify call in the header."
)]
pub async fn handler(
    user_auth: UserAuth,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<ApiUser>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &user_auth.user_vault_id()))
        .await??;
    Ok(Json(ApiResponseData::ok(ApiUser {
        phone_numbers: uvw
            .phone_number
            .as_ref()
            .map(ApiUserData::from)
            .map(|v| vec![v])
            .unwrap_or_default(),
        emails: uvw
            .email
            .as_ref()
            .map(ApiUserData::from)
            .map(|v| vec![v])
            .unwrap_or_default(),
    })))
}
