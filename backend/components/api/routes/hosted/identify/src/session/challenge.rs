use crate::session::requirements::get_requirements;
use crate::utils::initiate_challenge;
use crate::utils::InitiateChallengeArgs;
use crate::State;
use api_core::auth::session::GetSessionForUpdate;
use api_core::auth::user::IdentifyAuthContext;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::identify::get_user_auth_methods;
use api_wire_types::ChallengeRequest;
use api_wire_types::IdentifyChallengeResponse;
use api_wire_types::IdentifyRequirement;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;


#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Sends a challenge to the phone number or email saved in this identify session and returns an HTTP 200"
)]
#[actix::post("/hosted/identify/session/challenge")]
pub async fn post(
    request: Json<ChallengeRequest>,
    state: web::Data<State>,
    // When provided, creates a sandbox user with the given suffix
    insight_headers: InsightHeaders,
    root_span: RootSpan,
    identify: IdentifyAuthContext,
) -> ApiResponse<IdentifyChallengeResponse> {
    let requirements = get_requirements(&state, identify.clone(), root_span.clone()).await?;
    for r in requirements {
        let IdentifyRequirement::Login { .. } = r else {
            continue;
        };
        // The PII in this identify session identifies an existing vault at this tenant. We
        // should force the user to log into that vault instead of making a new
        // vault here.
        // NOTE: We used to only error if !user.can_initiate_signup_challenge. But nobody has actually moved
        // forward making a duplicate vault in this way, so we'll just hard block this for now.
        return Err(ErrorWithCode::ExistingVault(None).into());
    }

    let ChallengeRequest { challenge_kind } = request.into_inner();
    let su = identify.su.clone();
    let tenant = identify.data.tenant.clone();
    let ctx = get_user_auth_methods(&state, su.id.clone(), &[]).await?;
    let args = InitiateChallengeArgs {
        challenge_kind,
        tenant: Some(&tenant),
        user_token: None,
        user_session: Some(identify.session()),
        insight_headers,
    };
    let response = initiate_challenge(&state, ctx, args).await?;

    // Since these errors return an HTTP 200, log something special on the root span if there's an error
    match response.error {
        Some(_) => root_span.record("meta", "error"),
        None => root_span.record("meta", "no_error"),
    };

    // TODO store the challenge data in the identify session
    Ok(response)
}
