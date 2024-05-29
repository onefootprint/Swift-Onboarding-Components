use crate::GetIdentifyChallengeArgs;
use api_core::auth::ob_config::ObConfigAuth;
use api_core::telemetry::RootSpan;
use api_core::types::{
    JsonApiResponse,
    ResponseData,
};
use api_core::State;
use api_wire_types::{
    IdentifyId,
    LiteIdentifyRequest,
    LiteIdentifyResponse,
};
use itertools::Itertools;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
};

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Tries to identify an existing user by either phone number or email and returns whether a user exists. This is used exclusively in our SDK to check proactively if bootstrapped data identifies an existing user. This is very similar to the normal identify API, but it has a much simpler API will hopefully be more stable than the normal identify API since changes will break old SDK versions."
)]
#[actix::post("/hosted/identify/lite")]
pub async fn post(
    request: Json<LiteIdentifyRequest>,
    state: web::Data<State>,
    ob_context: Option<ObConfigAuth>,
    root_span: RootSpan,
) -> JsonApiResponse<LiteIdentifyResponse> {
    let LiteIdentifyRequest { email, phone_number } = request.into_inner();
    let identifiers = vec![
        email.as_ref().map(|e| IdentifyId::Email(e.clone())),
        phone_number.as_ref().map(|e| IdentifyId::PhoneNumber(e.clone())),
    ]
    .into_iter()
    .flatten()
    .collect_vec();
    let args = GetIdentifyChallengeArgs {
        user_auth: None,
        identifiers,
        sandbox_id: None,
        obc: ob_context.clone(),
        root_span,
    };
    let user_found = crate::get_identify_challenge_context(&state, args)
        .await?
        .is_some();
    let response = LiteIdentifyResponse { user_found };
    ResponseData::ok(response).json()
}
