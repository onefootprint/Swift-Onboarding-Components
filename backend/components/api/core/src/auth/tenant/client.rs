use std::sync::Arc;

use crate::{
    auth::{
        session::{tenant::ClientTenantAuth, AuthSessionData, ExtractableAuthSession},
        AuthError, CanDecrypt, CanVault, IsGuardMet, SessionContext,
    },
    errors::ApiResult,
};
use db::{models::tenant::Tenant, PgConn};
use itertools::Itertools;
use newtypes::{DataIdentifier, FpId, TenantApiKeyId};
use paperclip::actix::Apiv2Security;

use super::{AuthActor, TenantAuth};

#[derive(Debug, Clone)]
pub struct ClientTenantData {
    pub fp_id: FpId,
    pub is_live: bool,
    pub tenant: Tenant,
    pub scopes: Vec<ClientTenantScope>,
    pub tenant_api_key_id: TenantApiKeyId,
}

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    alias = "Client Token",
    in = "header",
    name = "X-Fp-Authorization",
    description = "Short-lived client token to perform actions for a given user."
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
        _: Arc<dyn feature_flag::FeatureFlagClient>,
    ) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::ClientTenant(data) => {
                let ClientTenantAuth {
                    fp_id,
                    is_live,
                    tenant_id,
                    scopes,
                    tenant_api_key_id,
                } = data;
                let tenant = Tenant::get(conn, &tenant_id)?;
                ClientTenantData {
                    fp_id,
                    is_live,
                    tenant,
                    scopes,
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

// Some custom permissions only used by ClientTenant auth

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
/// The scopes of a client tenant token are significantly different from normal tenant auth, so
/// we specify them with a new enum
pub enum ClientTenantScope {
    Vault(Vec<DataIdentifier>),
    Decrypt(Vec<DataIdentifier>),
}

impl IsGuardMet<ClientTenantScope> for CanDecrypt {
    fn is_met(self, token_scopes: &[ClientTenantScope]) -> bool {
        let decryptable_dis = token_scopes
            .iter()
            .flat_map(|s| match s {
                ClientTenantScope::Decrypt(dis) => dis.clone(),
                _ => vec![],
            })
            .collect_vec();
        self.0.into_iter().all(|di| decryptable_dis.contains(&di))
    }
}

impl IsGuardMet<ClientTenantScope> for CanVault {
    fn is_met(self, token_scopes: &[ClientTenantScope]) -> bool {
        let encryptable_dis = token_scopes
            .iter()
            .flat_map(|s| match s {
                ClientTenantScope::Vault(dis) => dis.clone(),
                _ => vec![],
            })
            .collect_vec();
        self.0.into_iter().all(|di| encryptable_dis.contains(&di))
    }
}

// Doesn't actually implement CanCheckTenantGuard or CheckTenantGuard - just uses ergonomics very
// similar to it
impl ClientTenantAuthContext {
    pub fn check_guard<T: IsGuardMet<ClientTenantScope>>(
        self,
        guard: T,
    ) -> Result<SessionContext<ClientTenantData>, AuthError> {
        let requested_permission_str = format!("{}", guard);
        if guard.is_met(&self.0.scopes) {
            Ok(self.map(|d| d.0))
        } else {
            Err(AuthError::MissingTenantPermission(requested_permission_str))
        }
    }
}
