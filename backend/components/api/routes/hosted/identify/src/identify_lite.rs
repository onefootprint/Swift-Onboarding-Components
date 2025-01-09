use crate::GetIdentifyChallengeArgs;
use crate::IdentifyLookupId;
use api_core::auth::ob_config::ObConfigAuth;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::State;
use api_wire_types::IdentifyId;
use api_wire_types::LiteIdentifyRequest;
use api_wire_types::LiteIdentifyResponse;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
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
) -> ApiResponse<LiteIdentifyResponse> {
    let LiteIdentifyRequest { email, phone_number } = request.into_inner();
    let identifiers = vec![
        email.as_ref().map(|e| IdentifyId::Email(e.clone())),
        phone_number.as_ref().map(|e| IdentifyId::PhoneNumber(e.clone())),
    ]
    .into_iter()
    .flatten()
    .collect_vec();
    let args = GetIdentifyChallengeArgs {
        identifier: IdentifyLookupId::Pii(identifiers),
        sandbox_id: None,
        playbook: ob_context.map(|obc| obc.playbook().clone()),
        root_span,
        kba_dls: vec![],
    };
    let user_found = crate::get_identify_challenge_context(&state, args)
        .await?
        .is_some();
    let response = LiteIdentifyResponse { user_found };
    Ok(response)
}
