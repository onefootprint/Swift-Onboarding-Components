use std::sync::Arc;

use db::PgConn;
use paperclip::actix::Apiv2Security;

use crate::auth::{
    session::{AuthSessionData, ExtractableAuthSession, RequestInfo},
    SessionContext,
};
use crate::{auth::AuthError, errors::ApiError};
use feature_flag::FeatureFlagClient;

use super::session::sdk_args::SdkArgsData;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "SDK Args Token",
    in = "header",
    name = "X-Fp-Sdk-Args-Token",
    description = "Short-lived token representing arguments for our SDK."
)]
pub struct ParsedSdkArgsSession {
    pub data: SdkArgsData,
}

/// Auth extractor for a short-lived session that represents the onboarding
pub type SdkArgsContext = SessionContext<ParsedSdkArgsSession>;

impl ExtractableAuthSession for ParsedSdkArgsSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Sdk-Args-Token"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        _: &mut PgConn,
        _: Arc<dyn FeatureFlagClient>,
        _: RequestInfo,
    ) -> Result<Self, ApiError> {
        let data = match auth_session {
            AuthSessionData::SdkArgs(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };

        Ok(ParsedSdkArgsSession { data })
    }

    fn log_authed_principal(&self, _: tracing_actix_web::RootSpan) {}
}
