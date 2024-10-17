//! Private Access Tokens -- alternative to captcha for iOS 16 + macOS 13 devices
//! https://www.ietf.org/archive/id/draft-ietf-privacypass-auth-scheme-02.html

use crate::auth::user::UserAuthContext;
use crate::utils::headers::InsightHeaders;
use crate::ApiResponse;
use crate::State;
use actix_web::HttpResponseBuilder;
use api_core::auth::user::UserAuthScope;
use api_core::errors::AssertionError;
use api_core::FpResult;
use db::models::insight_event::CreateInsightEvent;
use db::models::liveness_event::NewLivenessEvent;
use db::models::user_timeline::UserTimeline;
use newtypes::LivenessAttributes;
use newtypes::LivenessInfo;
use newtypes::LivenessIssuer;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web::{
    self,
};
use reqwest::header::AUTHORIZATION;
use reqwest::StatusCode;
use web::HttpResponse;

#[api_v2_operation(tags(Onboarding, Hosted), description = "initiates privacy pass protocol.")]
#[get("/hosted/onboarding/privacy_pass")]
pub async fn get(
    state: web::Data<State>,
    req: web::HttpRequest,
    user_auth: UserAuthContext,
    insight: InsightHeaders,
) -> ApiResponse<HttpResponse> {
    // check if this is an authorization or challenge request
    let auth_headers = req.headers().get_all(AUTHORIZATION);

    // TODO why is this implemented so strangely?
    if let Some(private_access_token) = auth_headers
        .filter_map(|h| h.to_str().ok())
        .filter_map(|h| h.strip_prefix("PrivateToken token="))
        .next()
    {
        authorize_privacy_pass(private_access_token, state, user_auth, insight).await
    } else {
        challenge_privacy_pass(state, user_auth).await
    }
}

async fn challenge_privacy_pass(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> ApiResponse<HttpResponse> {
    let nonce = user_auth.auth_token.hash_bytes();

    let challenge = privacy_pass::TokenChallenge::new(state.config.rp_id.clone(), nonce).marshal()?;

    let header = format!(
        "PrivateToken challenge={}, token-key={}",
        challenge,
        privacy_pass::ISSUER_TOKEN_PUBLIC_KEY
    );

    Ok(HttpResponseBuilder::new(StatusCode::UNAUTHORIZED)
        .append_header(("WWW-Authenticate", header))
        .finish())
}

#[tracing::instrument(skip(state))]
async fn authorize_privacy_pass(
    private_access_token: &str,
    state: web::Data<State>,
    user_auth: UserAuthContext,
    insight: InsightHeaders,
) -> ApiResponse<HttpResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let scoped_user_id =
        (user_auth.su_id.clone()).ok_or(AssertionError("User not initialized for privacy pass"))?;
    let nonce = user_auth.auth_token.hash_bytes();

    let challenge = privacy_pass::TokenChallenge::new(state.config.rp_id.clone(), nonce);
    tracing::info!(%private_access_token, "before verify PAT");

    let token = privacy_pass::Token::unmarshal(private_access_token)?;
    token.verify(&challenge)?;

    tracing::info!("verify pat success");

    state
        .db_transaction(move |conn| -> FpResult<_> {
            let insight_event = CreateInsightEvent::from(insight).insert_with_conn(conn)?;

            let liveness_event = NewLivenessEvent {
                scoped_vault_id: scoped_user_id.clone(),
                attributes: Some(LivenessAttributes {
                    issuers: vec![LivenessIssuer::Cloudflare, LivenessIssuer::Footprint],
                    ..Default::default()
                }),
                liveness_source: newtypes::LivenessSource::PrivacyPass,
                insight_event_id: Some(insight_event.id),
                skip_context: None,
            }
            .insert(conn)?;

            let info = LivenessInfo {
                id: liveness_event.id,
            };
            UserTimeline::create(conn, info, user_auth.user.id.clone(), scoped_user_id)?;

            Ok(())
        })
        .await?;

    Ok(HttpResponse::build(StatusCode::OK).json(api_wire_types::Empty))
}
