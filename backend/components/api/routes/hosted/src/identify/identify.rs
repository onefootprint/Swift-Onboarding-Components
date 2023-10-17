use super::ChallengeKind;
use crate::identify::get_user_challenge_context;
use crate::types::response::ResponseData;
use crate::State;

use api_core::{
    auth::{
        ob_config::ObConfigAuth,
        user::{UserAuth, UserAuthContext},
        Any,
    },
    errors::challenge::ChallengeError,
    fingerprinter::VaultIdentifier,
    telemetry::RootSpan,
    types::JsonApiResponse,
    utils::headers::SandboxId,
};
use api_wire_types::IdentifyRequest;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyResponse {
    user_found: bool,
    available_challenge_kinds: Option<Vec<ChallengeKind>>,
    /// signals that one or more biometric credentials
    /// support syncing and may be available to use on desktop/other devices
    has_syncable_pass_key: bool,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
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
            VaultIdentifier::AuthenticatedId(user_auth.user_vault_id().clone())
        }
        (None, Some(id)) => VaultIdentifier::IdentifyId(id, sandbox_id.0),
        (None, None) | (Some(_), Some(_)) => return Err(ChallengeError::OnlyOneIdentifier.into()),
    };

    // Look up existing user vault by identifier
    let (_, creds, kinds) =
        if let Some(ctx) = get_user_challenge_context(&state, identifier, ob_context, root_span).await? {
            ctx
        } else {
            // The user vault doesn't exist. Just return that the user wasn't found
            return Ok(Json(ResponseData {
                data: IdentifyResponse {
                    user_found: false,
                    available_challenge_kinds: None,
                    has_syncable_pass_key: false,
                },
            }));
        };

    let available_challenge_kinds: Option<Vec<ChallengeKind>> = Some(kinds);

    let has_syncable_pass_key = creds.iter().any(|cred| cred.backup_state);

    let response = IdentifyResponse {
        user_found: true,
        available_challenge_kinds,
        has_syncable_pass_key,
    };
    ResponseData::ok(response).json()
}
