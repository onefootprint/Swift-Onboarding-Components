use crate::auth::session::user::ContactInfoVerifySessionData;
use crate::auth::session::AllowSessionUpdate;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::LoadSessionContext;
use crate::auth::AuthError;
use crate::auth::SessionContext;
use crate::FpResult;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::PgConn;
use paperclip::actix::Apiv2Security;

#[derive(Debug, Clone, Apiv2Security, derive_more::Deref)]
#[openapi(
    apiKey,
    alias = "Async contact info verification token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived auth token for async verification of contact info."
)]
pub struct ContactInfoVerifySession {
    #[deref]
    pub data: ContactInfoVerifySessionData,
    pub tenant: Tenant,
    pub su: Option<ScopedVault>,
}

impl ExtractableAuthSession for ContactInfoVerifySession {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(conn: &mut PgConn, value: AuthSessionData, _: LoadSessionContext) -> FpResult<Self> {
        let data = match value {
            AuthSessionData::ContactInfoVerify(data) => data,
            _ => return Err(AuthError::SessionTypeError.into()),
        };
        let tenant = Tenant::get(conn, &data.tenant_id)?;
        let su = (data.su_id.as_ref())
            .map(|id| ScopedVault::get(conn, id))
            .transpose()?;

        Ok(ContactInfoVerifySession { tenant, su, data })
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("vault_id", self.uv_id.to_string());
        root_span.record("tenant_id", self.tenant_id.to_string());
        if let Some(su) = self.su.as_ref() {
            root_span.record("fp_id", su.fp_id.to_string());
            root_span.record("is_live", su.is_live);
        }
        root_span.record("auth_method", "contact_info_verify");
    }
}

pub type ContactInfoVerifyAuth = SessionContext<ContactInfoVerifySession>;

// Allow calling SessionContext<ContactInfoVerifySession>::update
impl AllowSessionUpdate for SessionContext<ContactInfoVerifySession> {}
