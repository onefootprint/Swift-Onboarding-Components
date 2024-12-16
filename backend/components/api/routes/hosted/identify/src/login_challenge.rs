use crate::utils::initiate_challenge;
use crate::utils::InitiateChallengeArgs;
use crate::GetIdentifyChallengeArgs;
use crate::IdentifyChallengeContext;
use crate::IdentifyLookupId;
use crate::State;
use api_core::auth::session::GetSessionForUpdate;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::headers::InsightHeaders;
use api_wire_types::IdentifyChallengeResponse;
use api_wire_types::LoginChallengeRequest;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Sends a challenge to the phone number and returns an HTTP 200. When the \
    challenge is completed through the identify/verify endpoint, the client can get or create \
    the user with this phone number."
)]
#[actix::post("/hosted/identify/login_challenge")]
pub async fn post(
    request: Json<LoginChallengeRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
    insight_headers: InsightHeaders,
    root_span: RootSpan,
) -> ApiResponse<IdentifyChallengeResponse> {
    let LoginChallengeRequest { challenge_kind } = request.into_inner();
    let user_auth = user_auth.check_guard(Any)?;
    let token = user_auth.auth_token.clone();
    let session = user_auth.clone().session();

    // Look up existing user vault by identifier
    let args = GetIdentifyChallengeArgs {
        identifier: IdentifyLookupId::User(user_auth.user_vault_id.clone(), user_auth.su_id.clone()),
        kba_dis: &user_auth.kba,
        sandbox_id: None,
        playbook: user_auth.playbook.clone(),
        root_span: root_span.clone(),
    };
    let Some(ctx) = crate::get_identify_challenge_context(&state, args).await? else {
        // The user vault doesn't exist. Just return that the user wasn't found
        return Err(ErrorWithCode::LoginChallengeUserNotFound.into());
    };
    let IdentifyChallengeContext { mut ctx, tenant, .. } = ctx;
    ctx.auth_methods.retain(|am| am.can_initiate_login_challenge);
    let args = InitiateChallengeArgs {
        challenge_kind,
        tenant: tenant.as_ref(),
        user_session: Some((token, session)),
        insight_headers,
    };
    let response = initiate_challenge(&state, ctx, args).await?;

    // Since these errors return an HTTP 200, log something special on the root span if there's an error
    match response.error {
        Some(_) => root_span.record("meta", "error"),
        None => root_span.record("meta", "no_error"),
    };

    Ok(response)
}
