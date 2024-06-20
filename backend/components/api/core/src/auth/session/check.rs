use crate::auth::AuthError;
use crate::{
    ModernApiError,
    State,
};
use actix_web::{
    web,
    FromRequest,
};
use chrono::Utc;
use db::models::session::Session;
use futures_util::Future;
use newtypes::{
    PiiString,
    SessionAuthToken,
};
use paperclip::actix::Apiv2Security;
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Session Token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Session token."
)]
pub enum CheckSessionContext {
    Active,
    Expired,
    InvalidOrNotFound,
}

impl CheckSessionContext {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization", "X-Fp-Dashboard-Authorization"]
    }
}

impl FromRequest for CheckSessionContext {
    type Error = ModernApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap().clone();
        let auth_token = Self::header_names()
            .into_iter()
            .filter_map(|h| req.headers().get(h))
            .next()
            .and_then(|hv| hv.to_str().map(PiiString::from).ok());

        Box::pin(async move {
            let allowed_headers = Self::header_names().join(", ");
            let auth_token = auth_token.ok_or_else(|| AuthError::MissingHeader(allowed_headers.clone()))?;
            let auth_token = SessionAuthToken::from(auth_token);

            let key = auth_token.id();
            let session = state
                .db_pool
                .db_query(move |conn| Session::get(conn, key))
                .await?;
            let result = if let Some(session) = session {
                if session.expires_at < Utc::now() {
                    Self::Expired
                } else {
                    Self::Active
                }
            } else {
                Self::InvalidOrNotFound
            };
            Ok(result)
        })
    }
}
