use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::ApiResponse;
use crate::State;
use actix_web::http::header::ContentType;
use actix_web::http::StatusCode;
use actix_web::HttpResponse;
use api_core::auth::tenant::ClientTenantScope;
use api_core::auth::tenant::PathClientTenantAuthContext;
use api_core::auth::tenant::TenantAuth;
use api_core::auth::AuthError;
use api_core::errors::tenant::TenantError;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::EnclaveDecryptOperation;
use api_core::utils::vault_wrapper::Pii;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::FpResult;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::AccessEventPurpose;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[route_alias(get(
    "/users/vault/decrypt/{token}",
    tags(ClientVaulting, Vault, Users, PublicApi, HideWhenLocked),
    description = "Decrypts and downloads the user's data as specified by the provided token.",
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Decrypts and downloads the entity's data as specified by the provided token.",
    tags(ClientVaulting, Vault, Entities, Private)
)]
#[get("/entities/vault/decrypt/{token}")]
pub async fn get(
    state: web::Data<State>,
    auth: PathClientTenantAuthContext,
    insights: InsightHeaders,
) -> ApiResponse<HttpResponse> {
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
        .ok_or(AuthError::MissingClientTokenPermission(
            "decrypt_download".to_owned(),
        ))?;
    let reason = auth
        .data
        .decrypt_reason
        .ok_or(TenantError::NoDecryptionReasonProvided)?;

    let vw = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let scoped_vault: ScopedVault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &scoped_vault.id)?;
            Ok(vw)
        })
        .await?;

    let op = EnclaveDecryptOperation {
        identifier: di.clone(),
        transforms: vec![],
    };
    let insight = CreateInsightEvent::from(insights);
    let purpose = AccessEventPurpose::Api;
    let result = vw
        .fn_decrypt_raw(&state, reason, principal, insight, vec![op.clone()], purpose)
        .await?
        .remove(&op)
        .ok_or(TenantError::DataDoesntExist(di.clone()))?;
    let mime_type = vw.get_mime_type(&di);

    let mut resp = HttpResponse::build(StatusCode::OK);
    resp.insert_header(("Content-Disposition", "attachment"));
    if let Some(mime_type) = mime_type {
        resp.insert_header(("Content-Type", mime_type.to_owned()));
    } else {
        resp.content_type(ContentType::plaintext());
    }
    let response = match result {
        Pii::Value(s) => resp.body(s.to_piistring()?.leak_to_string()),
        Pii::Bytes(b) => resp.body(b.into_leak()),
    };
    Ok(response)
}
