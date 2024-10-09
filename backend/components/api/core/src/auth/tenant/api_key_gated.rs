use super::BasicTenantAuth;
use super::CanCheckTenantGuard;
use super::TenantApiKeyAuth;
use super::TenantAuth;
use crate::auth::AuthError;
use crate::auth::Either;
use actix_web::FromRequest;
use newtypes::PreviewApiMarker;
use newtypes::TenantScope;
use std::future::Future;
use std::marker::PhantomData;
use std::pin::Pin;
use tracing::Instrument;

// TODO: also this
#[derive(Debug, Clone, derive_more::Deref)]
/// Auth extractor that requires a tenant API key to be provided for a tenant that has access to the
/// `PreviewApi` defined by `T`.
pub struct TenantApiKeyGated<T>(#[deref] TenantApiKeyAuth, PhantomData<T>);

impl<T: PreviewApiMarker> FromRequest for TenantApiKeyGated<T> {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    #[tracing::instrument("TenantApiKeyGated::from_request", skip_all)]
    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        let fut = TenantApiKeyAuth::from_request(req, payload);
        let extractor = async move {
            let auth = fut.await?;
            // Check preview API guard during extraction
            let preview_api = T::preview_api();
            let tenant = match &auth {
                Either::Left(l) => l.0.tenant(),
                Either::Right(r) => &r.0.tenant,
            };
            if !tenant.can_access_preview(&preview_api) {
                tracing::error!(tenant_id=%tenant.id, tenant_name=%tenant.name, api=%preview_api, "Tenant {} attempting to use unallowed preview API: {}", tenant.name, preview_api);
                return Err(AuthError::CannotAccessPreviewApi.into());
            }
            Ok(Self(auth, PhantomData))
        };
        Box::pin(extractor.in_current_span())
    }
}

impl<T> CanCheckTenantGuard for TenantApiKeyGated<T> {
    type Auth = Box<dyn TenantAuth>;

    fn raw_token_scopes(&self) -> Vec<TenantScope> {
        self.0.raw_token_scopes()
    }

    fn auth(self) -> Box<dyn TenantAuth> {
        self.0.auth()
    }

    fn purpose(&self) -> Option<newtypes::TenantSessionPurpose> {
        self.0.purpose()
    }
}

impl<T: PreviewApiMarker> paperclip::v2::schema::Apiv2Schema for TenantApiKeyGated<T> {
    fn name() -> Option<String> {
        Some("Secret API Key".to_string())
    }

    fn security_scheme() -> Option<paperclip::v2::models::SecurityScheme> {
        Some(paperclip::v2::models::SecurityScheme {
            type_: "apiKey".to_string(),
            name: Some("X-Footprint-Secret-Key".to_string()),
            in_: Some("header".to_string()),
            flow: None,
            auth_url: None,
            token_url: None,
            scopes: [
                (format!("preview:{}", T::preview_api()), "".to_string())
            ].into_iter().collect(),
            description: Some("Secret API key. You can create and view your API keys in the dashboard. This key should never be sent to your client and should be treated as a secret on your server.".to_string()),
        })
    }
}
impl<T: PreviewApiMarker> paperclip::actix::OperationModifier for TenantApiKeyGated<T> {}
