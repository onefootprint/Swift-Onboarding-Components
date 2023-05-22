use crate::{
    auth::{
        session::{tenant::ClientTenantAuth, AuthSessionData, ExtractableAuthSession},
        AuthError, CanDecrypt, SessionContext,
    },
    errors::ApiResult,
};
use db::{models::tenant::Tenant, PgConn};
use feature_flag::LaunchDarklyFeatureFlagClient;
use newtypes::{DataIdentifier, FpId, TenantApiKeyId};
use paperclip::actix::Apiv2Security;

use super::{AuthActor, TenantAuth};

#[derive(Debug, Clone)]
pub struct ClientTenantData {
    pub fp_id: FpId,
    pub is_live: bool,
    pub tenant: Tenant,
    pub fields: Vec<DataIdentifier>,
    pub tenant_api_key_id: TenantApiKeyId,
}

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived client token to perform actions for a given user"
)]
pub struct ParsedClientTenantData(ClientTenantData);

/// A shorthand for the extractor for a firm employee auth session
pub type ClientTenantAuthContext = SessionContext<ParsedClientTenantData>;

impl ExtractableAuthSession for ParsedClientTenantData {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        _: LaunchDarklyFeatureFlagClient,
    ) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::ClientTenant(data) => {
                let ClientTenantAuth {
                    fp_id,
                    is_live,
                    tenant_id,
                    fields,
                    tenant_api_key_id,
                } = data;
                let tenant = Tenant::get(conn, &tenant_id)?;
                ClientTenantData {
                    fp_id,
                    is_live,
                    tenant,
                    fields,
                    tenant_api_key_id,
                }
            }
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        Ok(Self(data))
    }
}

// Doesn't actually implement CanCheckTenantGuard or CheckTenantGuard - just uses ergonomics very
// similar to it
impl ClientTenantAuthContext {
    pub fn check_guard(self, guard: CanDecrypt) -> Result<SessionContext<ClientTenantData>, AuthError> {
        let requested_permission_str = format!("{}", guard);
        if guard.0.into_iter().all(|di| self.data.0.fields.contains(&di)) {
            Ok(self.map(|d| d.0))
        } else {
            Err(AuthError::MissingTenantPermission(requested_permission_str))
        }
    }
}

// Though this is a little different, still implement TenantAuth for maximal code sharing
impl TenantAuth for SessionContext<ClientTenantData> {
    fn tenant(&self) -> &db::models::tenant::Tenant {
        &self.tenant
    }

    fn is_live(&self) -> Result<bool, crate::ApiError> {
        Ok(self.is_live)
    }

    fn actor(&self) -> AuthActor {
        AuthActor::TenantApiKey(self.tenant_api_key_id.clone())
    }

    fn rolebinding(&self) -> Option<&db::models::tenant_rolebinding::TenantRolebinding> {
        None
    }
}
