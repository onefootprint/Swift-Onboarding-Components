use super::session::sdk_args::SdkArgsData;
use super::session::LoadSessionContext;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::FpResult;
use db::PgConn;
use paperclip::actix::Apiv2Security;

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
        _: &mut PgConn,
        auth_session: AuthSessionData,
        _: LoadSessionContext,
    ) -> FpResult<Self> {
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
