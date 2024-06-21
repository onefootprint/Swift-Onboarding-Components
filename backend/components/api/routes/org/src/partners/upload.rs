use actix_multipart::Multipart;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::errors::ValidationError;
use api_core::types::ModernApiResult;
use api_core::utils::file_upload::handle_file_upload;
use api_core::FpResult;
use api_core::State;
use chrono::Utc;
use crypto::seal::SealedChaCha20Poly1305DataKey;
use db::models::compliance_doc::ComplianceDoc;
use db::models::compliance_doc_request::ComplianceDocRequest;
use db::models::compliance_doc_submission::NewComplianceDocSubmission;
use db::models::tenant_compliance_partnership::TenantCompliancePartnership;
use newtypes::ComplianceDocData;
use newtypes::ComplianceDocId;
use newtypes::ComplianceDocRequestId;
use newtypes::S3Url;
use newtypes::SealedVaultDataKey;
use newtypes::TenantCompliancePartnershipId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web::HttpRequest;
use paperclip::actix::web::{
    self,
};
use paperclip::actix::{
    self,
};

const MIN_DOCUMENT_SIZE_IN_BYTES: usize = 1;
const MAX_DOCUMENT_SIZE_IN_BYTES: usize = 10 * 1024 * 1024;

#[api_v2_operation(
    description = "Upload a document in response to a request",
    tags(Compliance, Private)
)]
#[actix::post("/org/partners/{partnership_id}/requests/{request_id}/submissions/upload")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocRequestId)>,
    mut payload: Multipart,
    request: HttpRequest,
) -> ModernApiResult<api_wire_types::Empty> {
    let auth = auth.check_guard(TenantGuard::ManageComplianceDocSubmission)?;
    let tenant = auth.tenant();
    let tenant_id = tenant.id.clone();

    let (partnership_id, request_id) = args.into_inner().clone();
    let submitted_by_tenant_user_id = auth.actor().tenant_user_id()?.clone();

    // Check permissions before uploading anything.
    let params = (tenant_id.clone(), partnership_id.clone(), request_id.clone());
    let document_id = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let (tenant_id, partnership_id, request_id) = params;
            // Check that the authorized tenant owns the partnership.
            TenantCompliancePartnership::get(conn, &partnership_id, &tenant_id)?;

            let doc = ComplianceDoc::get(conn, &request_id, &partnership_id)?;

            Ok(doc.id)
        })
        .await?;

    let file = handle_file_upload(
        &mut payload,
        &request,
        None,
        MAX_DOCUMENT_SIZE_IN_BYTES,
        MIN_DOCUMENT_SIZE_IN_BYTES,
    )
    .await?;
    let filename = file.filename;

    let (e_data_key, data_key) =
        SealedChaCha20Poly1305DataKey::generate_sealed_random_chacha20_poly1305_key_with_plaintext(
            tenant.public_key.as_ref(),
        )?;
    let e_data_key = SealedVaultDataKey::try_from(e_data_key.sealed_key)?;
    let sealed_bytes = data_key.seal_bytes(file.bytes.leak_slice())?;

    let bucket = &state.config.document_s3_bucket.clone();
    let key = doc_s3_key(&partnership_id, &document_id);

    let s3_url = state
        .s3_client
        .put_bytes(bucket, key, sealed_bytes.0, Some(file.mime_type.clone()))
        .await?;
    tracing::info!(s3_url = s3_url, partnership_id=%partnership_id, document_id=%request_id, filename=%filename, mime_type=%file.mime_type, "Uploaded compliance document to S3");

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            // We've already validated that the authorized user matches the partnership.

            let doc = ComplianceDoc::lock(conn, &request_id, &partnership_id)?;

            let Some(req) = ComplianceDocRequest::get_active(conn, &doc)?.filter(|req| req.id == request_id)
            else {
                return ValidationError("Can only submit documents for the latest request").into();
            };

            let doc_data = ComplianceDocData::SealedUpload {
                filename,
                s3_url: S3Url::from(s3_url),
                e_data_key,
            };
            NewComplianceDocSubmission {
                created_at: Utc::now(),
                request_id: &req.id,
                submitted_by_tenant_user_id: &submitted_by_tenant_user_id,
                doc_data: &doc_data,
                compliance_doc_id: &doc.id,
            }
            .create(conn, &doc)?;

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}

fn doc_s3_key(partnership_id: &TenantCompliancePartnershipId, document_id: &ComplianceDocId) -> String {
    let partnership_namespace = crypto::base64::encode_config(
        crypto::sha256(partnership_id.to_string().as_bytes()),
        crypto::base64::URL_SAFE_NO_PAD,
    );
    let doc_namespace = crypto::base64::encode_config(
        crypto::sha256(document_id.to_string().as_bytes()),
        crypto::base64::URL_SAFE_NO_PAD,
    );
    format!(
        "compliance_docs/encrypted/{}/{}/{}",
        partnership_namespace,
        doc_namespace,
        crypto::random::gen_random_alphanumeric_code(32),
    )
}
