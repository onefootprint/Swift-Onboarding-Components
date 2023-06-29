use std::pin::Pin;

use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::errors::ApiError;
use crate::errors::ApiResult;

use crate::proxy;
use crate::proxy::token_parser::ProxyTokenParser;
use crate::utils::headers::InsightHeaders;
use crate::State;

use actix_web::FromRequest;
use api_core::api_headers_schema;
use api_core::auth::CanDecrypt;
use api_core::utils::headers::get_header;
use futures_util::Future;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, post, web, web::HttpRequest, web::HttpResponse};
use paperclip::v2::models::DefaultSchemaRaw;
use paperclip::v2::models::Parameter;
use reqwest::StatusCode;

api_headers_schema! {
    pub mod reflect_headers {
        /// When reflect requests are on behalf of a single footprint vault, you can
        /// can omit the `fp_id_` prefix on token identifiers, and just use `id.x` or `custom.y` instead
        /// of `fp_id_xyz.id.x` or `fp_id_xyz.custom.y`.
        #[required = false]
        USER_TOKEN_ASSIGNMENT_HEADER = "x-fp-id";

        /// Access reason for any decryption operations during the reflection request
        #[required = false]
        ACCESS_REASON = "x-fp-access-reason";

    }
}

/// Expose the headers to docs
#[derive(Debug, Clone)]
pub struct HeaderParams;
impl paperclip::v2::schema::Apiv2Schema for HeaderParams {
    fn header_parameter_schema() -> Vec<Parameter<DefaultSchemaRaw>> {
        reflect_headers::schema()
    }
}
impl paperclip::actix::OperationModifier for HeaderParams {}
impl FromRequest for HeaderParams {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;
    fn from_request(_: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        Box::pin(async move { Ok(HeaderParams) })
    }
}

#[tracing::instrument(skip(state, body_bytes, request))]
#[api_v2_operation(
    description = "Decrypt complex objects in place. Like the vault proxy endpoints, but reflects back the hydrated request to the caller.",
    tags(VaultProxy, Preview)
)]
#[post("/vault_proxy/reflect")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    body_bytes: web::Bytes,
    insight: InsightHeaders,
    request: HttpRequest,
    _: HeaderParams,
) -> ApiResult<HttpResponse> {
    let body_bytes = body_bytes.to_vec();
    let Some(body) = std::str::from_utf8(&body_bytes).ok() else {
        return Err(ApiError::InvalidProxyBody);
    };

    // 0. pull out a global fp_id if exists
    let global_fp_id =
        get_header(reflect_headers::USER_TOKEN_ASSIGNMENT_HEADER, request.headers()).map(FpId::from);

    // 1. parse
    let parser = ProxyTokenParser::parse(body, global_fp_id)?;
    let auth = auth.check_guard(CanDecrypt::new(
        parser.matches.keys().map(|tok| tok.identifier.clone()).collect(),
    ))?;

    // 2. detokenize
    let detokens = proxy::detokenize::detokenize(
        &state,
        auth.as_ref(),
        parser.matches.keys().cloned().collect(),
        get_header(reflect_headers::ACCESS_REASON, request.headers()),
        insight.clone(),
    )
    .await?;

    let detokenized_body = parser.detokenize_body(detokens)?;

    // 3. build the reflect response
    let mut builder = HttpResponse::build(StatusCode::OK);
    let response = builder.body(detokenized_body.leak().as_bytes().to_vec());
    Ok(response)
}
