use crate::auth::user::UserAuthScope;
use crate::errors::ApiError;
use crate::types::{
    EmptyResponse,
    JsonApiResponse,
};
use crate::State;
use actix_web::web::Json;
use api_core::auth::user::UserWfAuthContext;
use api_wire_types::hosted::socure_device::SocureDeviceSessionIdRequest;
use db::models::socure_device_session::SocureDeviceSession;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Records a deviceSessionId from the Socure Device SDK in the frontend"
)]
#[actix::post("/hosted/onboarding/sds")] // TODO: unsure if we want a clear name like /socure_device_session_id/ or if we want to at least
                                         // mildly obfuscate this
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    request: Json<SocureDeviceSessionIdRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let wf_id = user_auth.workflow().id.clone();

    let SocureDeviceSessionIdRequest { device_session_id } = request.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            SocureDeviceSession::create(conn, device_session_id, wf_id)?;

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
