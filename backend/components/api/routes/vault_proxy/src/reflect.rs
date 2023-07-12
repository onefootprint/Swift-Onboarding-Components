use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::errors::ApiError;
use crate::errors::ApiResult;

use crate::proxy;
use crate::proxy::token_parser::ProxyTokenParser;
use crate::utils::headers::InsightHeaders;
use crate::State;

use api_core::api_headers_schema;
use api_core::auth::CanDecrypt;
use api_core::utils::body_bytes::BodyBytes;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, post, web, web::HttpResponse};
use reqwest::StatusCode;

api_headers_schema! {
    pub struct ReflectHeaderParams {
        required: {}
        optional: {
            /// When reflect requests are on behalf of a single footprint vault, you can
            /// can omit the `fp_id_` prefix on token identifiers, and just use `id.x` or `custom.y` instead
            /// of `fp_id_xyz.id.x` or `fp_id_xyz.custom.y`.
            user_token_assignment: FpId = "x-fp-id";

            /// Access reason for any decryption operations during the reflection request
            access_reason: String = "x-fp-access-reason";
        }
    }
}

#[tracing::instrument(skip(state, body_bytes, params))]
#[api_v2_operation(
    description = "Decrypt complex objects in place. Like the vault proxy endpoints, but reflects back the hydrated request to the caller.",
    tags(VaultProxy, Preview)
)]
#[post("/vault_proxy/reflect")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    body_bytes: BodyBytes<5_242_880>,
    insight: InsightHeaders,
    params: ReflectHeaderParams,
) -> ApiResult<HttpResponse> {
    let body_bytes = body_bytes.to_vec();
    let Some(body) = std::str::from_utf8(&body_bytes).ok() else {
        return Err(ApiError::InvalidProxyBody);
    };

    // 0. pull out a global fp_id if exists
    let global_fp_id = params.user_token_assignment;

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
        params.access_reason,
        insight.clone(),
    )
    .await?;

    let detokenized_body = parser.detokenize_body(detokens)?;

    // 3. build the reflect response
    let mut builder = HttpResponse::build(StatusCode::OK);
    let response = builder.body(detokenized_body.leak().as_bytes().to_vec());
    Ok(response)
}
