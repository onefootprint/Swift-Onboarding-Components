use std::collections::{HashMap, HashSet};

/// Decrypt document data for a footprint user
///   2022-11-28: We do not support PUT operations (interested customers should use custom vault for document data they wish to store)
use crate::auth::tenant::{CanDecrypt, CheckTenantGuard, SecretTenantAuthContext, TenantGuard};
use crate::auth::{tenant::TenantUserAuthContext, Either};

use crate::errors::ApiError;
use crate::types::{JsonApiResponse, ResponseData};

use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::identity_document::DecryptDocumentResult;
use crate::utils::user_vault_wrapper::{DecryptRequest, TenantUvw, UserVaultWrapper};
use crate::State;

use api_wire_types::{
    DecryptIdentityDocumentRequest, DecryptIdentityDocumentResponse, DecryptedDocumentStatus,
    GetIdentityDocumentForDecryptResponse, ImageData,
};
use chrono::{DateTime, Utc};
use db::models::document_request::DocumentRequest;
use db::models::identity_document::IdentityDocument;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;
use db::PgConnection;
use itertools::Itertools;
use newtypes::{DataIdentifier, DocumentRequestStatus, FootprintUserId, IdDocKind, IdentityDocumentId};

use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};
use strum::IntoEnumIterator;

#[api_v2_operation(
    description = "Checks existence if items in the document vault.",
    tags(Vault, PublicApi, Users)
)]
#[actix::get("/users/{footprint_user_id}/vault/identity/document")]
pub async fn get(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    tenant_auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<GetIdentityDocumentForDecryptResponse> {
    let tenant_auth = tenant_auth.check_guard(TenantGuard::Read)?;
    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok(uvw)
        })
        .await??;

    let targets = IdDocKind::iter().map(DataIdentifier::IdDocument).collect_vec();
    uvw.check_ob_config_access(&targets)?;

    // TODO migrate this to a list instead of a hashmap
    let response = GetIdentityDocumentForDecryptResponse::from(HashMap::from_iter(
        available_images_from_uvw(&uvw).into_iter().map(|d| (d, true)),
    ));
    ResponseData::ok(response).json()
}

#[api_v2_operation(
    description = "Decryptes images from in the document vault.",
    tags(Vault, PublicApi, Users)
)]
#[actix::post("/users/{footprint_user_id}/vault/identity/document/decrypt")]
pub async fn post_decrypt(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptIdentityDocumentRequest>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptIdentityDocumentResponse> {
    let DecryptIdentityDocumentRequest {
        document_type,
        reason,
        include_selfie,
    } = request.into_inner();

    let targets = [
        Some(DataIdentifier::IdDocument(document_type)),
        include_selfie.then_some(DataIdentifier::Selfie(document_type)),
    ]
    .into_iter()
    .flatten()
    .collect_vec();

    let auth = auth.check_guard(CanDecrypt::new(targets.clone()))?;

    let footprint_user_id = path.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::build_for_tenant(conn, &scoped_user.id)?;

            Ok(uvw)
        })
        .await??;

    // Important to check requester has access. TODO is there a better way to have type safety here?
    // Can we put in decrypt_document?
    uvw.check_ob_config_access(&targets)?;

    let req = DecryptRequest {
        reason,
        principal: auth.actor().into(),
        insight: CreateInsightEvent::from(insights),
    };
    // As of 2022-11-28: It's possible a user has more than 1 document of a given document_type
    let decrypted_docs = uvw
        .decrypt_document(&state, document_type, include_selfie, req)
        .await?;

    let images = state
        .db_pool
        .db_query(move |conn| create_image_data(conn, decrypted_docs))
        .await??;

    let res = DecryptIdentityDocumentResponse {
        document_type,
        images,
    };

    ResponseData::ok(res).json()
}

/// Splitting out since we may in the future want to filter on things like
/// expired/is_valid etc
fn available_images_from_uvw(uvw: &TenantUvw) -> HashSet<IdDocKind> {
    uvw.identity_documents().iter().map(|i| i.document_type).collect()
}

type StatusAndUploadedAt = (DecryptedDocumentStatus, DateTime<Utc>);
fn create_image_data(
    conn: &mut PgConnection,
    decrypted_docs: Vec<DecryptDocumentResult>,
) -> Result<Vec<ImageData>, ApiError> {
    // For this, we'll create the status just based on whether or not the upload was successful
    let mut status_map: HashMap<IdentityDocumentId, StatusAndUploadedAt> =
        IdentityDocument::get_bulk_with_requests(
            conn,
            decrypted_docs.iter().map(|d| &d.identity_document_id).collect(),
        )?
        .into_iter()
        .filter_map(|(id, (id_doc, doc_request))| {
            status_for_document(&doc_request).map(|s| (id, (s, id_doc.created_at)))
        })
        .collect();

    let images = decrypted_docs
        .into_iter()
        .filter_map(|doc| {
            status_map
                .remove(&doc.identity_document_id)
                .map(|(status, uploaded_at)| ImageData {
                    front: doc.front.into_leak_base64().to_string_standard(),
                    back: doc.back.map(|p| p.into_leak_base64().to_string_standard()),
                    selfie: doc.selfie.map(|p| p.into_leak_base64().to_string_standard()),
                    status,
                    uploaded_at,
                })
        })
        .collect();

    Ok(images)
}

fn status_for_document(document_request: &DocumentRequest) -> Option<DecryptedDocumentStatus> {
    match document_request.status {
        DocumentRequestStatus::Failed => Some(DecryptedDocumentStatus::Fail),
        DocumentRequestStatus::Complete => Some(DecryptedDocumentStatus::Success),
        // If doc request is not in failed/complete, there's nothing to return
        // this is kept completely enumerated so that we don't miss doc request status variants
        DocumentRequestStatus::Pending => None,
        DocumentRequestStatus::Uploaded => None,
        DocumentRequestStatus::UploadFailed => None,
    }
}
