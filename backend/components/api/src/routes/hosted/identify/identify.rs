use super::{ChallengeKind, Identifier};
use crate::errors::ApiError;
use crate::hosted::identify::get_user_challenge_context;
use crate::types::response::ResponseData;
use crate::State;

use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    identifier: Identifier,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyResponse {
    user_found: bool,
    available_challenge_kinds: Option<Vec<ChallengeKind>>,
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
) -> actix_web::Result<Json<ResponseData<IdentifyResponse>>, ApiError> {
    let IdentifyRequest { identifier } = request.into_inner();

    // Look up existing user vault by identifier
    let (_, _, kinds) =
        if let Some(user_challenge_context) = get_user_challenge_context(&state, &identifier).await? {
            user_challenge_context
        } else {
            // The user vault doesn't exist. Just return that the user wasn't found
            return Ok(Json(ResponseData {
                data: IdentifyResponse {
                    user_found: false,
                    available_challenge_kinds: None,
                },
            }));
        };

    let available_challenge_kinds: Option<Vec<ChallengeKind>> = Some(kinds);

    Ok(Json(ResponseData {
        data: IdentifyResponse {
            user_found: true,
            available_challenge_kinds,
        },
    }))
}
