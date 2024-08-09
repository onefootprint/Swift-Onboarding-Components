use super::AuthActor;
use super::TenantAuth;
use crate::auth::session::tenant::ClientTenantAuth;
use crate::auth::session::AuthSessionData;
use crate::auth::session::ExtractableAuthSession;
use crate::auth::session::RequestInfo;
use crate::auth::AuthError;
use crate::auth::CanDecrypt;
use crate::auth::CanVault;
use crate::auth::DisplayGuardError;
use crate::auth::IsGuardMet;
use crate::auth::SessionContext;
use crate::FpResult;
use crate::State;
use actix_web::web;
use db::models::tenant::Tenant;
use db::PgConn;
use futures_util::Future;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSource;
use newtypes::FpId;
use newtypes::PiiString;
use newtypes::TenantApiKeyId;
use paperclip::v2::models::DataType;
use paperclip::v2::models::DefaultSchemaRaw;
use paperclip::v2::models::Parameter;
use paperclip::v2::models::ParameterIn;
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

#[derive(Debug, Clone)]
pub struct ParsedClientTenantData(ClientTenantData);

impl paperclip::v2::schema::Apiv2Schema for ParsedClientTenantData {
    fn name() -> Option<String> {
        Some("x-fp-authorization".to_string())
    }

    fn required() -> bool {
        true
    }

    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        vec![Parameter {
            name: "x-fp-authorization".to_owned(),
            in_: ParameterIn::Header,
            required: true,
            data_type: Some(DataType::String),
            description: Some(
                "Short-lived client token issued by the `POST /users/{fp_id}/client_token` API.".to_string(),
            ),
            // Need to provide the schema again in order to provide an example
            schema: Some(paperclip::v2::models::DefaultSchemaRaw {
                name: Some("x-fp-authorization".to_owned()),
                data_type: Some(paperclip::v2::models::DataType::String),
                example: Some(serde_json::Value::String(
                    "cttok_UxM6Vbvk2Rcy1gzcSuXgk3sj3L9I0pAnNH".to_owned(),
                )),
                ..Default::default()
            }),
            ..Default::default()
        }]
    }
}
impl paperclip::actix::OperationModifier for ParsedClientTenantData {}

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
    ) -> FpResult<Self> {
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

    fn is_live(&self) -> FpResult<bool> {
        Ok(self.is_live)
    }

    fn actor(&self) -> AuthActor {
        AuthActor::TenantApiKey(self.tenant_api_key_id.clone())
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

fn can_decrypt(di: &DataIdentifier, token_scopes: &[ClientTenantScope]) -> bool {
    token_scopes.iter().any(|s| match s {
        ClientTenantScope::Decrypt(dis) => dis.contains(di),
        _ => false,
    })
}

impl IsGuardMet<ClientTenantScope> for CanDecrypt {
    fn is_met(&self, token_scopes: &[ClientTenantScope]) -> bool {
        self.0.iter().all(|di| can_decrypt(di, token_scopes))
    }
}

impl DisplayGuardError<ClientTenantScope> for CanDecrypt {
    fn error_display(&self, token_scopes: &[ClientTenantScope]) -> String {
        let cannot_decrypt_dis = self
            .0
            .iter()
            .filter(|di| !can_decrypt(di, token_scopes))
            .cloned()
            .collect();
        CanDecrypt(cannot_decrypt_dis).to_string()
    }
}


fn can_vault(di: &DataIdentifier, token_scopes: &[ClientTenantScope]) -> bool {
    token_scopes.iter().any(|s| match s {
        ClientTenantScope::Vault(dis) => dis.contains(di),
        _ => false,
    })
}

impl IsGuardMet<ClientTenantScope> for CanVault {
    fn is_met(&self, token_scopes: &[ClientTenantScope]) -> bool {
        self.0.iter().all(|di| can_vault(di, token_scopes))
    }
}

impl DisplayGuardError<ClientTenantScope> for CanVault {
    fn error_display(&self, token_scopes: &[ClientTenantScope]) -> String {
        let cannot_decrypt_dis = self
            .0
            .iter()
            .filter(|di| !can_vault(di, token_scopes))
            .cloned()
            .collect();
        CanDecrypt(cannot_decrypt_dis).to_string()
    }
}

// Doesn't actually implement CanCheckTenantGuard or CheckTenantGuard - just uses ergonomics very
// similar to it
impl ClientTenantAuthContext {
    pub fn check_guard<T: IsGuardMet<ClientTenantScope>>(
        self,
        guard: T,
    ) -> Result<SessionContext<ClientTenantData>, AuthError> {
        let requested_permission_str = guard.error_display(&self.0.scopes);
        if guard.is_met(&self.0.scopes) {
            Ok(self.map(|d| d.0))
        } else {
            Err(AuthError::MissingTenantPermission(requested_permission_str))
        }
    }
}
