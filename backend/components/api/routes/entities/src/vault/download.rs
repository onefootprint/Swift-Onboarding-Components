use crate::errors::ApiResult;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use actix_web::http::header::ContentType;
use actix_web::HttpResponse;
use api_core::auth::tenant::{ClientTenantScope, PathClientTenantAuthContext, TenantAuth};
use api_core::auth::AuthError;
use api_core::errors::tenant::TenantError;
use api_core::utils::vault_wrapper::{Any, DecryptRequest, Pii, TenantVw};
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use paperclip::actix::{api_v2_operation, get, web};

#[route_alias(get(
    "/users/vault/decrypt/{token}",
    tags(Client, Vault, Users, Preview),
    description = "Decrypts and downloads the user's data as specified by the provided token.",
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Decrypts and downloads the entity's data as specified by the provided token.",
    tags(Client, Vault, Entities, Private)
)]
#[get("/entities/vault/decrypt/{token}")]
pub async fn get(
    state: web::Data<State>,
    auth: PathClientTenantAuthContext,
    insights: InsightHeaders,
) -> ApiResult<HttpResponse> {
    // Any guard here since we enforce that we have the DecryptDownload permission below
    let auth = auth.0.check_guard(api_core::auth::Any)?;
    let principal = auth.actor().into();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = auth.fp_id.clone();
    let di = auth
        .data
        .scopes
        .into_iter()
        .flat_map(|s| match s {
            ClientTenantScope::DecryptDownload(di) => Some(di),
            _ => None,
        })
        .next()
        .ok_or(AuthError::MissingTenantPermission("decrypt_download".to_owned()))?;
    let reason = auth
        .data
        .decrypt_reason
        .ok_or(TenantError::NoDecryptionReasonProvided)?;

    let vw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let scoped_vault: ScopedVault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &scoped_vault.id)?;
            Ok(vw)
        })
        .await??;
    let req = DecryptRequest {
        reason,
        principal,
        insight: CreateInsightEvent::from(insights),
    };
    let result = vw
        .decrypt_single_raw(&state, di.clone(), req)
        .await?
        .ok_or(TenantError::DataDoesntExist(di))?;

    // TODO mime type and headers. Maybe we don't need mime type? browser seems to infer
    // TODO tests

    let response = match result {
        Pii::String(s) => HttpResponse::Ok()
            .content_type(ContentType::plaintext())
            .insert_header(("Content-Disposition", "attachment"))
            .body(s.leak_to_string()),
        Pii::Bytes(b) => HttpResponse::Ok()
            .content_type(ContentType::plaintext())
            .insert_header(("Content-Disposition", "attachment"))
            .body(b.into_leak()),
    };
    Ok(response)
}
