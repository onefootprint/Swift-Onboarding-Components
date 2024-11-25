use crate::auth::session::onboarding::BoSession;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::LoadSessionContext;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::FpResult;
use db::models::business_owner::BusinessOwner;
use db::models::ob_configuration::ObConfiguration;
use db::models::tenant::Tenant;
use db::PgConn;
use newtypes::ObConfigurationKind;
use paperclip::actix::Apiv2Security;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Business Owner Token",
    in = "header",
    name = "X-Kyb-Bo-Token",
    description = "Token to initialize KYC of a business owner. Uniquely identifies a business and beneficial owner."
)]
pub struct ParsedBoSession {
    pub tenant: Tenant,
    pub ob_config: ObConfiguration,
    pub bo: BusinessOwner,
    pub data: BoSession,
}

/// Auth extractor for a session to KYC a business owner
pub type BoSessionAuth = SessionContext<ParsedBoSession>;

impl ExtractableAuthSession for ParsedBoSession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Kyb-Bo-Token"]
    }

    fn try_load_session(
        conn: &mut PgConn,
        auth_session: AuthSessionData,
        _: LoadSessionContext,
    ) -> FpResult<Self> {
        let data = match auth_session {
            AuthSessionData::BusinessOwner(data) => data,
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        let (_, ob_config) = ObConfiguration::get_enabled(conn, &data.ob_config_id)?;
        if ob_config.kind != ObConfigurationKind::Kyb {
            return Err(AuthError::BusinessNotRequired.into());
        }

        let tenant = Tenant::get(conn, &ob_config.tenant_id)?;

        let bo = BusinessOwner::get(conn, &data.bo_id)?;
        // Note: the bo may or may not have a populated user_vault_id

        tracing::info!(tenant_id=%tenant.id, ob_config_id=%ob_config.id, bo_id=%bo.id, user_vault_id=%format!("{:?}", bo.user_vault_id), "kyb session authenticated");

        Ok(Self {
            tenant,
            ob_config,
            bo,
            data,
        })
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.tenant.id.to_string());
        root_span.record("is_live", self.ob_config.is_live);
        root_span.record("auth_method", "bo_session");
    }
}
