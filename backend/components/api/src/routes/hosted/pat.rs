//! Private Access Tokens -- alternative to captcha for iOS 16 + macOS 13 devices
//! https://www.ietf.org/archive/id/draft-ietf-privacypass-auth-scheme-02.html

use actix_web::HttpResponseBuilder;
use paperclip::actix::{
    api_v2_operation, get,
    web::{self},
};
use reqwest::{
    header::{AUTHORIZATION},
    StatusCode,
};
use web::HttpResponse;

use crate::{
    errors::ApiResult,
    types::{EmptyResponse},
    State,
};

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "initiates privacy pass protocol."
)]
#[get("/hosted/privacy_pass")]
pub async fn handler(
    state: web::Data<State>,
    req: web::HttpRequest,
    // onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
    // user_auth: UserAuthContext,
) -> ApiResult<HttpResponse> {
    // check if this is an authorization or challenge request
    let auth_headers = req.headers().get_all(AUTHORIZATION);

    if let Some(private_access_token) = auth_headers
        .filter_map(|h| h.to_str().ok())
        .filter_map(|h| h.strip_prefix("PrivateToken token="))
        .next()
    {
        authorize_privacy_pass(private_access_token, state).await
    } else {
        challenge_privacy_pass(state).await
    }
}

async fn challenge_privacy_pass(
    state: web::Data<State>,
    // onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
    // user_auth: UserAuthContext,
) -> ApiResult<HttpResponse> {
    // todo: rethink context here here
    let fake_nonce = [1u8; 32];
    let challenge = privacy_pass::TokenChallenge::new(state.config.rp_id.clone(), fake_nonce).marshal()?;

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
    // onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
    // user_auth: UserAuthContext,
) -> ApiResult<HttpResponse> {
    // todo: rethink context here here
    let fake_nonce = [1u8; 32];

    let challenge = privacy_pass::TokenChallenge::new(state.config.rp_id.clone(), fake_nonce);
    tracing::info!(%private_access_token, "before verify PAT");
    
    let token = privacy_pass::Token::unmarshal(private_access_token)?;
    token.verify(&challenge)?;

    tracing::info!("verify pat success");

    Ok(HttpResponse::build(StatusCode::OK).json(EmptyResponse {}))
}
