/// Decrypt document data for a footprint user
///   2022-11-28: We do not support PUT operations (interested customers should use custom vault for document data they wish to store)
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::auth::{tenant::TenantSessionAuth, Either};

use crate::errors::ApiError;

use crate::utils::headers::InsightHeaders;

use crate::utils::vault_wrapper::{DecryptRequest, VaultWrapper};
use crate::State;

use actix_web::HttpResponse;
use api_core::auth::CanDecrypt;
use api_wire_types::DecryptDocumentRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;

use newtypes::{DocumentKind, FpId};

use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

#[api_v2_operation(description = "Decrypts document in the vault.", tags(Vault, Preview, Users))]
#[actix::post("/users/{fp_id}/vault/document/decrypt")]
pub async fn post_decrypt(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<DecryptDocumentRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> actix_web::Result<HttpResponse, ApiError> {
    let DecryptDocumentRequest { kind, reason } = request.into_inner();
    let kind = DocumentKind::try_from(kind)?;

    let auth = auth.check_guard(CanDecrypt::single(kind))?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = path.into_inner();

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let su = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw = VaultWrapper::build_for_tenant(conn, &su.id)?;

            Ok(uvw)
        })
        .await??;

    let req = DecryptRequest {
        reason,
        principal: auth.actor().into(),
        insight: CreateInsightEvent::from(insights),
    };
    let doc = uvw
        .decrypt_document(&state, kind, req)
        .await?
        .ok_or(ApiError::ResourceNotFound)?;

    Ok(HttpResponse::Ok()
        .content_type(doc.document.mime_type)
        .body(doc.plaintext.into_leak()))
}
