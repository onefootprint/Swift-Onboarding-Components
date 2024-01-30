use crate::auth::user::{UserAuth, UserAuthContext};
use crate::errors::{ApiError, ApiResult};
use crate::types::response::ResponseData;
use crate::utils::vault_wrapper::{VaultWrapper, VwArgs};
use crate::State;
use api_core::auth::user::UserAuthGuard;
use api_core::errors::user::UserError;
use api_core::utils::vault_wrapper::Person;
use api_core::ApiErrorKind;
use newtypes::{ContactInfoKind, PhoneNumber};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct D2pSmsRequest {
    url: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct D2pSmsResponse {
    time_before_retry_s: i64,
}

#[api_v2_operation(
    operation_id = "hosted-onboarding-d2p-sms",
    tags(D2p, Hosted),
    description = "Send an SMS with a link to the phone onboarding page."
)]
#[post("/hosted/onboarding/d2p/sms")]
pub async fn handler(
    user_auth: UserAuthContext,
    request: Json<D2pSmsRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<D2pSmsResponse>>, ApiError> {
    let user_auth = user_auth.check_guard(UserAuthGuard::Handoff)?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let su_id = user_auth.scoped_user_id();
            let args = if let Some(su_id) = su_id.as_ref() {
                // If the auth token is during an onboarding session, create a UVW that sees all
                // speculative data for the tenant in order to see a speculative phone number
                // that was added by this tenant.
                VwArgs::Tenant(su_id)
            } else {
                // Otherwise, create a UVW that only sees portable data
                VwArgs::Vault(user_auth.user_vault_id())
            };
            let uvw = VaultWrapper::<Person>::build(conn, args)?;
            Ok(uvw)
        })
        .await??;

    let (phone_number, ci, _) = uvw
        .decrypt_contact_info(&state, ContactInfoKind::Phone)
        .await?
        .ok_or(ApiErrorKind::ContactInfoKindNotInVault(ContactInfoKind::Phone))?;

    if !ci.is_otp_verified {
        // The d2p link we send out is authenticated as the user.
        // So, we want to make sure a tenant can't update the user's phone number/email
        // and then get an authenticated link. First, check that the phone number/email was
        // verified by the user.
        return Err(UserError::ContactInfoKindNotVerified(ContactInfoKind::Phone).into());
    }
    let phone_number = PhoneNumber::parse(phone_number)?;

    let time_before_retry_s = state
        .sms_client
        .send_d2p(&state, &phone_number, request.url.clone())
        .await?;

    Ok(Json(ResponseData::ok(D2pSmsResponse {
        time_before_retry_s: time_before_retry_s.num_seconds(),
    })))
}
