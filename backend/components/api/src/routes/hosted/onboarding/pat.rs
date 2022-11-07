//! Private Access Tokens -- alternative to captcha for iOS 16 + macOS 13 devices
//! https://www.ietf.org/archive/id/draft-ietf-privacypass-auth-scheme-02.html

use actix_web::HttpResponseBuilder;
use db::models::{audit_trail::AuditTrail, liveness_event::NewLivenessEvent, onboarding::Onboarding};
use newtypes::{AuditTrailEvent, LivenessCheckInfo};
use paperclip::actix::{
    api_v2_operation, get,
    web::{self},
};
use reqwest::{header::AUTHORIZATION, StatusCode};
use serde_json::json;
use web::HttpResponse;

use crate::{
    auth::user::{UserAuthContext, UserAuthScopeDiscriminant},
    errors::{onboarding::OnboardingError, ApiError, ApiResult},
    types::EmptyResponse,
    utils::insight_headers::InsightHeaders,
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
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;
    let nonce = user_auth.auth_token.hash_bytes();

    let challenge = privacy_pass::TokenChallenge::new(state.config.rp_id.clone(), nonce);
    tracing::info!(%private_access_token, "before verify PAT");

    let token = privacy_pass::Token::unmarshal(private_access_token)?;
    token.verify(&challenge)?;

    tracing::info!("verify pat success");

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let ob_info = user_auth.assert_onboarding(conn)?;
            let ob_config = ob_info.ob_config;
            let (onboarding, _) = Onboarding::lock_by_config(conn, &ob_info.user_vault_id, &ob_config.id)?
                .ok_or(OnboardingError::NoOnboarding)?;

            if onboarding.is_authorized {
                return Err(ApiError::Custom("Cannot edit completed onboarding".to_owned()));
            }

            let trail_event = AuditTrailEvent::LivenessCheck(LivenessCheckInfo {
                // TODO: get issuer programmatically
                attestations: vec!["Footprint".to_owned(), "Cloudflare".to_owned()],
                device: None,
                os: None,
                user_agent: insight.user_agent.clone(),
                ip_address: insight.ip_address.clone(),
                location: insight.location(),
            });
            AuditTrail::create(conn, trail_event, ob_info.user_vault_id, None, None)?;

            let attributes = Some(json!({
                // TODO: get issuer programmatically
                "issuer": "Cloudflare",
                "insight": insight
            }));

            let _ = NewLivenessEvent {
                onboarding_id: onboarding.id,
                attributes,
                liveness_source: newtypes::LivenessSource::PrivacyPass,
            }
            .insert(conn)?;

            Ok(())
        })
        .await?;

    Ok(HttpResponse::build(StatusCode::OK).json(EmptyResponse {}))
}
