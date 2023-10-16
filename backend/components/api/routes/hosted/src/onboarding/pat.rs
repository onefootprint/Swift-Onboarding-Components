//! Private Access Tokens -- alternative to captcha for iOS 16 + macOS 13 devices
//! https://www.ietf.org/archive/id/draft-ietf-privacypass-auth-scheme-02.html

use actix_web::HttpResponseBuilder;
use api_core::{auth::user::UserAuthGuard, errors::AssertionError};
use db::models::{
    insight_event::CreateInsightEvent, liveness_event::NewLivenessEvent, user_timeline::UserTimeline,
};
use newtypes::{LivenessAttributes, LivenessInfo, LivenessIssuer};
use paperclip::actix::{
    api_v2_operation, get,
    web::{self},
};
use reqwest::{header::AUTHORIZATION, StatusCode};

use web::HttpResponse;

use crate::{
    auth::user::{UserAuth, UserAuthContext},
    errors::{ApiError, ApiResult},
    types::EmptyResponse,
    utils::headers::InsightHeaders,
    State,
};

#[api_v2_operation(tags(Hosted, Bifrost), description = "initiates privacy pass protocol.")]
#[get("/hosted/onboarding/privacy_pass")]
pub async fn get(
    state: web::Data<State>,
    req: web::HttpRequest,
    user_auth: UserAuthContext,
    insight: InsightHeaders,
) -> ApiResult<HttpResponse> {
    // check if this is an authorization or challenge request
    let auth_headers = req.headers().get_all(AUTHORIZATION);

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
) -> ApiResult<HttpResponse> {
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
) -> ApiResult<HttpResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    let scoped_user_id = user_auth
        .scoped_user_id()
        .ok_or(AssertionError("User not initialized for privacy pass"))?;
    let nonce = user_auth.auth_token.hash_bytes();

    let challenge = privacy_pass::TokenChallenge::new(state.config.rp_id.clone(), nonce);
    tracing::info!(%private_access_token, "before verify PAT");

    let token = privacy_pass::Token::unmarshal(private_access_token)?;
    token.verify(&challenge)?;

    tracing::info!("verify pat success");

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let insight_event = CreateInsightEvent::from(insight).insert_with_conn(conn)?;

            let liveness_event = NewLivenessEvent {
                scoped_vault_id: scoped_user_id.clone(),
                attributes: Some(LivenessAttributes {
                    issuers: vec![LivenessIssuer::Cloudflare, LivenessIssuer::Footprint],
                    ..Default::default()
                }),
                liveness_source: newtypes::LivenessSource::PrivacyPass,
                insight_event_id: Some(insight_event.id),
            }
            .insert(conn)?;

            let info = LivenessInfo {
                id: liveness_event.id,
            };
            UserTimeline::create(conn, info, user_auth.user_vault_id().clone(), scoped_user_id)?;

            Ok(())
        })
        .await?;

    Ok(HttpResponse::build(StatusCode::OK).json(EmptyResponse {}))
}
