use crate::{UserChallengeContext, VaultIdentifier};

use api_core::{
    auth::{ob_config::ObConfigAuth, user::UserAuthContext, Any},
    errors::challenge::ChallengeError,
    telemetry::RootSpan,
    types::{JsonApiResponse, ResponseData},
    utils::headers::SandboxId,
    State,
};
use api_wire_types::{IdentifyRequest, IdentifyResponse};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Tries to identify an existing user by either phone number or email. If the user \
    is found, returns available challenge kinds."
)]
#[actix::post("/hosted/identify")]
pub async fn post(
    request: Json<IdentifyRequest>,
    state: web::Data<State>,
    ob_context: Option<ObConfigAuth>,
    // When provided, identifies only sandbox users with the suffix
    sandbox_id: SandboxId,
    // When provided, is used to identify the currently authed user. Will generate a challenge
    // for the authed user
    user_auth: Option<UserAuthContext>,
    root_span: RootSpan,
) -> JsonApiResponse<IdentifyResponse> {
    let IdentifyRequest { identifier } = request.into_inner();

    // Require one of user_auth or identifier
    let identifier = match (user_auth, identifier) {
        (Some(user_auth), None) => {
            let user_auth = user_auth.check_guard(Any)?;
            VaultIdentifier::AuthenticatedId(user_auth)
        }
        (None, Some(id)) => VaultIdentifier::IdentifyId(id, sandbox_id.0),
        (None, None) | (Some(_), Some(_)) => return Err(ChallengeError::OnlyOneIdentifier.into()),
    };

    // Look up existing user vault by identifier
    let Some(ctx) = crate::get_user_challenge_context(&state, identifier, ob_context, root_span).await?
    else {
        // The user vault doesn't exist. Just return that the user wasn't found
        return Ok(Json(ResponseData {
            data: IdentifyResponse {
                user_found: false,
                is_unverified: false,
                available_challenge_kinds: None,
                has_syncable_pass_key: false,
            },
        }));
    };

    let UserChallengeContext {
        webauthn_creds,
        challenge_kinds,
        is_unverified,
        ..
    } = ctx;

    let has_syncable_pass_key = webauthn_creds.iter().any(|cred| cred.backup_state);
    let response = IdentifyResponse {
        is_unverified,
        user_found: true,
        available_challenge_kinds: Some(challenge_kinds),
        has_syncable_pass_key,
    };
    ResponseData::ok(response).json()
}
