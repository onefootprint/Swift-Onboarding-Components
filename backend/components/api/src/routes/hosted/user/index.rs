use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::email::Email;
use db::models::phone_number::PhoneNumber;
use db::models::user_vault::UserVault;
use newtypes::DataPriority;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct FpUserData {
    pub id: String, // TODO
    pub is_verified: bool,
    pub priority: DataPriority,
}

impl From<&Email> for FpUserData {
    fn from(email: &Email) -> Self {
        Self {
            id: email.id.to_string(),
            is_verified: email.is_verified,
            priority: email.priority,
        }
    }
}

impl From<&PhoneNumber> for FpUserData {
    fn from(phone_number: &PhoneNumber) -> Self {
        Self {
            id: phone_number.id.to_string(),
            is_verified: phone_number.is_verified,
            priority: phone_number.priority,
        }
    }
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct FpUser {
    pub phone_numbers: Vec<FpUserData>,
    pub emails: Vec<FpUserData>,
    // TODO can expand this to include many other data kinds
}

#[api_v2_operation(
    tags(Hosted),
    description = "Returns a decrypted profile for the logged-in user. Requires user authentication \
    from a successful /identify/verify call in the header."
)]
#[actix::get("/hosted/user")]
pub async fn get(
    user_auth: UserAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<FpUser>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::BasicProfile])?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uv = UserVault::get(conn, &user_auth.user_vault_id())?;
            let uvw = UserVaultWrapper::get_committed(conn, uv)?;
            Ok(uvw)
        })
        .await??;
    Ok(Json(ResponseData::ok(FpUser {
        phone_numbers: uvw
            .phone_number
            .as_ref()
            .map(FpUserData::from)
            .map(|v| vec![v])
            .unwrap_or_default(),
        emails: uvw
            .email
            .as_ref()
            .map(FpUserData::from)
            .map(|v| vec![v])
            .unwrap_or_default(),
    })))
}
