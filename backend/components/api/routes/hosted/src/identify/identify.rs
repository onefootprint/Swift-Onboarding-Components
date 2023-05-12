use super::ChallengeKind;
use crate::errors::ApiError;
use crate::identify::get_user_challenge_context;
use crate::types::response::ResponseData;
use crate::State;

use api_core::auth::ob_config::ObConfigAuth;
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
) -> actix_web::Result<Json<ResponseData<IdentifyResponse>>, ApiError> {
    let IdentifyRequest { identifier } = request.into_inner();

    // Look up existing user vault by identifier
    let t_id = ob_context.as_ref().map(|obc| &obc.tenant().id);
    let (_, webauthn_creds, kinds) = if let Some(user_challenge_context) =
        get_user_challenge_context(&state, identifier.into(), t_id).await?
    {
        user_challenge_context
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

    let has_syncable_pass_key = webauthn_creds.iter().any(|cred| cred.backup_state);

    Ok(Json(ResponseData {
        data: IdentifyResponse {
            user_found: true,
            available_challenge_kinds,
            has_syncable_pass_key,
        },
    }))
}
