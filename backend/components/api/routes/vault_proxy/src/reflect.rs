use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::proxy;
use crate::proxy::token_parser::ProxyTokenParser;
use crate::utils::headers::InsightHeaders;
use crate::ApiResponse;
use crate::State;
use api_core::api_headers_schema;
use api_core::auth::CanDecrypt;
use api_core::telemetry::RootSpan;
use api_core::utils::body_bytes::BodyBytes;
use api_core::ApiCoreError;
use newtypes::AccessEventPurpose;
use newtypes::FpId;
use newtypes::PiiString;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::HttpResponse;
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

#[api_v2_operation(
    description = "Given a raw HTTP body, decrypts data tokens in place for up to 1000 users at a time. Can be used to generate reports or test payloads that will be sent using the vault proxy. Tokens use the same syntax as the vault proxy. More information on vault proxy tokens can be found [here](https://docs.onefootprint.com/vault/proxy#basics-token-body-template-format).",
    tags(VaultProxy, PublicApi)
)]
#[post("/vault_proxy/reflect")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    body_bytes: BodyBytes<5_242_880>,
    insight: InsightHeaders,
    params: ReflectHeaderParams,
    root_span: RootSpan,
) -> ApiResponse<HttpResponse> {
    let body_bytes = body_bytes.to_vec();
    let Some(body) = std::str::from_utf8(&body_bytes).ok() else {
        return Err(ApiCoreError::InvalidProxyBody.into());
    };

    // 0. pull out a global fp_id if exists
    let global_fp_id = params.user_token_assignment;

    // 1. parse
    let (parser, tokens) = ProxyTokenParser::parse_and_log_fp_id(body, global_fp_id, root_span)?;
    let auth = auth.check_guard(CanDecrypt::new(
        tokens.iter().map(|tok| tok.identifier.clone()).collect(),
    ))?;

    // 2. detokenize
    let detokens = proxy::detokenize::detokenize(
        &state,
        auth.as_ref(),
        tokens,
        params.access_reason,
        insight.clone(),
        AccessEventPurpose::Reflect,
    )
    .await?;

    let detokenized_body = parser.detokenize_body(&detokens)?;

    // 3. build the reflect response
    build_response(detokenized_body)
}

#[tracing::instrument(skip_all)]
fn build_response(detokenized_body: PiiString) -> ApiResponse<HttpResponse> {
    let mut builder = HttpResponse::build(StatusCode::OK);
    let response = builder.body(detokenized_body.leak().as_bytes().to_vec());
    Ok(response)
}
