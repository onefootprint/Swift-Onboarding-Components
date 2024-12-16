use crate::auth::ob_config::ObConfigAuthTrait;
use crate::auth::session::identify::BusinessInfo;
use crate::auth::session::identify::IdentifySession;
use crate::auth::session::onboarding::OnboardingSessionTrustedMetadata;
use crate::auth::session::AllowSessionUpdate;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::LoadSessionContext;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::FpResult;
use api_errors::BadRequestInto;
use db::models::auth_event::AuthEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::PgConn;
use newtypes::VaultKind;
use paperclip::actix::Apiv2Security;

#[derive(Debug, Clone, derive_more::Deref, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Identify Token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived auth token for an identify session."
)]
pub struct IdentifySessionContext {
    pub uv: Vault,
    pub playbook: Playbook,
    pub obc: ObConfiguration,
    pub tenant: Tenant,
    pub su: ScopedVault,
    pub auth_events: Vec<AuthEvent>,
    #[deref]
    /// The underlying session data that's stored in the database
    pub session: IdentifySession,
}

// Allow calling SessionContext<IdentifySessionContext>::update_session
impl AllowSessionUpdate for SessionContext<IdentifySessionContext> {}

impl IdentifySessionContext {
    pub const HEADER_NAME: &'static str = "X-Fp-Authorization";
}

impl ExtractableAuthSession for IdentifySessionContext {
    fn header_names() -> Vec<&'static str> {
        vec![IdentifySessionContext::HEADER_NAME]
    }

    fn try_load_session(
        conn: &mut PgConn,
        value: AuthSessionData,
        ctx: LoadSessionContext,
    ) -> FpResult<Self> {
        let AuthSessionData::Identify(data) = value else {
            return Err(AuthError::SessionTypeError.into());
        };

        let uv = Vault::get(conn, &data.placeholder_uv_id)?;
        if uv.kind != VaultKind::Person {
            return Err(AuthError::NonPersonVault.into());
        }
        let su = ScopedVault::get(conn, (&data.placeholder_su_id, &uv.id))?;
        let (playbook, obc) = ObConfiguration::get(conn, &data.obc_id)?;

        let tenant = Tenant::get(conn, &su.tenant_id)?;
        let auth_events = AuthEvent::get_bulk(conn, &data.auth_event_ids)?;

        // Every few minutes, set the heartbeat when a uv auth session authenticates
        // as this scoped user. This allows us to track when users are still
        // in progress and the last time we've seen the user
        if !ctx.req.method.is_safe() {
            // Only do this in non-read-only API requests so we don't have unintended
            // side effects in HTTP GET/OPTIONS/TRACE/HEAD requests
            su.set_heartbeat(conn)?;
        }

        if playbook.is_live != uv.is_live {
            return BadRequestInto("Invalid auth session: playbook live mode does not match user live mode");
        }

        let data = IdentifySessionContext {
            uv,
            playbook,
            obc,
            tenant,
            su,
            auth_events,
            session: data,
        };
        Ok(data)
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("uv_id", &self.uv.id.to_string());
        root_span.record("tenant_id", self.su.tenant_id.to_string());
        root_span.record("fp_id", self.su.fp_id.to_string());
        root_span.record("is_live", self.su.is_live);
        root_span.record("auth_method", "identify_session");
    }
}

/// A shorthand for the commonly used ParsedIdentifySessionContext context
pub type IdentifyAuthContext = SessionContext<IdentifySessionContext>;

impl ObConfigAuthTrait for IdentifyAuthContext {
    fn ob_config(&self) -> &ObConfiguration {
        &self.obc
    }

    fn tenant(&self) -> &Tenant {
        &self.tenant
    }

    fn trusted_metadata(&self) -> Option<OnboardingSessionTrustedMetadata> {
        self.session.metadata.clone()
    }

    fn business_info(&self) -> Option<BusinessInfo> {
        self.session.business_info.clone()
    }
}
