use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::{CanDecrypt, SecretTenantAuthContext, TenantSessionAuth};
use crate::auth::user::{AuthedOnboardingInfo, UserAuthContext, UserAuthScopeDiscriminant};
use crate::auth::Either;
use crate::errors::{ApiError, ApiResult};
use crate::types::response::{EmptyResponse, ResponseData};
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::{DecryptRequest, VaultWrapper};
use crate::utils::{self, file_upload};
use crate::State;
use actix_multipart::Multipart;
use actix_web::web::Path;
use actix_web::{HttpRequest, HttpResponse};
use api_wire_types::DecryptDocumentRequest;

use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use newtypes::{DataIdentifier, DocumentKind, FootprintUserId, VaultPublicKey};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

const MAX_DOC_SIZE_BYTES: usize = 5_048_576;

#[api_v2_operation(description = "POSTs a document to the vault", tags(Hosted))]
#[actix::post("/hosted/user/upload/{document_identifier}")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    document_identifier: web::Path<DataIdentifier>,
    mut payload: Multipart,
    request: HttpRequest,
) -> actix_web::Result<Json<ResponseData<EmptyResponse>>, ApiError> {
    let kind = DocumentKind::try_from(document_identifier.into_inner())?;

    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;
    let ua = user_auth.clone();
    let (auth_info, public_key) = state
        .db_pool
        .db_query(
            move |conn| -> Result<(AuthedOnboardingInfo, VaultPublicKey), ApiError> {
                //For now, only allow doc uploads during Bifrost
                let auth_info = ua.assert_onboarding(conn)?;
                let uv = Vault::get(conn, &auth_info.scoped_user.id)?;
                Ok((auth_info, uv.public_key))
            },
        )
        .await??;

    let file = file_upload::handle_file_upload(
        &mut payload,
        &request,
        kind.accepted_mime_types(),
        MAX_DOC_SIZE_BYTES,
    )
    .await?;

    let (e_data_key, s3_url) = utils::vault_wrapper::encrypt_to_s3(
        &state,
        &file,
        kind,
        &public_key,
        &auth_info.user_vault_id,
        &auth_info.scoped_user.id,
    )
    .await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user_id = utils::vault_wrapper::checks::pre_add_data_checks(&user_auth, conn)?;
            let uvw = VaultWrapper::lock_for_onboarding(conn, &scoped_user_id)?;
            let doc = uvw.put_document(conn, kind, file.mime_type, file.filename, e_data_key, s3_url)?;
            Ok(doc)
        })
        .await?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(description = "Decrypts document in the vault.", tags(Vault, Preview, Users))]
#[actix::post("/users/{footprint_user_id}/vault/document/decrypt")]
pub async fn document_decrypt(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptDocumentRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> actix_web::Result<HttpResponse, ApiError> {
    let DecryptDocumentRequest { kind, reason } = request.into_inner();
    let kind = DocumentKind::try_from(kind)?;

    let auth = auth.check_guard(CanDecrypt::single(kind))?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let footprint_user_id = path.into_inner();

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let su = ScopedVault::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
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
