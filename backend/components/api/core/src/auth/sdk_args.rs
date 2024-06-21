use super::session::sdk_args::SdkArgsData;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::errors::ApiResult;
use db::PgConn;
use feature_flag::FeatureFlagClient;
use paperclip::actix::Apiv2Security;
use std::sync::Arc;

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
    ) -> ApiResult<Self> {
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
