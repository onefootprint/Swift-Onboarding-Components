use super::{
    AuthActor,
    TenantAuth,
};
use crate::auth::session::tenant::ClientTenantAuth;
use crate::auth::session::{
    AuthSessionData,
    ExtractableAuthSession,
    RequestInfo,
};
use crate::auth::{
    AuthError,
    CanDecrypt,
    CanVault,
    IsGuardMet,
    SessionContext,
};
use crate::errors::ApiResult;
use crate::State;
use actix_web::web;
use db::models::tenant::Tenant;
use db::PgConn;
use futures_util::Future;
use itertools::Itertools;
use newtypes::{
    DataIdentifier,
    DataLifetimeSource,
    FpId,
    PiiString,
    TenantApiKeyId,
};
use paperclip::actix::Apiv2Security;
use paperclip::v2::models::{
    DataType,
    DefaultSchemaRaw,
    Parameter,
    ParameterIn,
};
use std::pin::Pin;
use std::sync::Arc;
use tracing_actix_web::RootSpan;

#[derive(Debug, Clone)]
pub struct ClientTenantData {
    pub fp_id: FpId,
    pub is_live: bool,
    pub tenant: Tenant,
    pub scopes: Vec<ClientTenantScope>,
    pub tenant_api_key_id: TenantApiKeyId,
    pub decrypt_reason: Option<String>,
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

/// A version of ClientTenantAuthContext that extracts the token from the URL path rather than a
/// header
pub struct PathClientTenantAuthContext(pub ClientTenantAuthContext);

impl paperclip::v2::schema::Apiv2Schema for PathClientTenantAuthContext {
    fn name() -> Option<String> {
        Some("token".to_string())
    }

    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        vec![Parameter {
            name: "token".to_owned(),
            in_: ParameterIn::Path,
            required: true,
            data_type: Some(DataType::String),
            description: Some("Short-lived client token with `decrypt_download` permissions to download a single piece of vaulted data.".to_string()),
            ..Default::default()
        }]
    }
}
impl paperclip::actix::OperationModifier for PathClientTenantAuthContext {}

impl actix_web::FromRequest for PathClientTenantAuthContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap().clone();
        let root_span = RootSpan::from_request(req, payload);
        let auth_token = Some(PiiString::from(req.match_info().query("token")));
        let req = RequestInfo::from(req);

        Box::pin(async move {
            let auth = ClientTenantAuthContext::build(state, root_span, auth_token, req).await?;
            Ok(Self(auth))
        })
    }
}

impl ExtractableAuthSession for ParsedClientTenantData {
    fn header_names() -> Vec<&'static str> {
        vec!["X-Fp-Authorization"]
    }

    fn try_load_session(
        auth_session: AuthSessionData,
        conn: &mut PgConn,
        _: Arc<dyn feature_flag::FeatureFlagClient>,
        _: RequestInfo,
    ) -> ApiResult<Self> {
        let data = match auth_session {
            AuthSessionData::ClientTenant(data) => {
                let ClientTenantAuth {
                    fp_id,
                    is_live,
                    tenant_id,
                    scopes,
                    tenant_api_key_id,
                    decrypt_reason,
                } = data;
                let tenant = Tenant::get(conn, &tenant_id)?;
                ClientTenantData {
                    fp_id,
                    is_live,
                    tenant,
                    scopes,
                    tenant_api_key_id,
                    decrypt_reason,
                }
            }
            _ => {
                return Err(AuthError::SessionTypeError.into());
            }
        };
        tracing::info!(api_key_id=%data.tenant_api_key_id.to_string(), "Authed client session");
        Ok(Self(data))
    }

    fn log_authed_principal(&self, root_span: tracing_actix_web::RootSpan) {
        root_span.record("tenant_id", &self.0.tenant.id.to_string());
        root_span.record("fp_id", &self.0.fp_id.to_string());
        root_span.record("is_live", self.0.is_live);
        root_span.record("auth_method", "client_tenant");
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

    fn scopes(&self) -> Vec<newtypes::TenantScope> {
        // This is false in some cases. Maybe ClientTenantAuth shouldn't implement TenantAuth
        vec![]
    }

    fn dl_source(&self) -> DataLifetimeSource {
        DataLifetimeSource::ClientTenant
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
    DecryptDownload(DataIdentifier),
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
