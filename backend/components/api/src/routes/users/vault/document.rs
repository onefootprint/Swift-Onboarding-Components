use std::collections::{HashMap, HashSet};

/// Decrypt document data for a footprint user
///   2022-11-28: We do not support PUT operations (interested customers should use custom vault for document data they wish to store)
use crate::auth::tenant::{CanDecrypt, CheckTenantGuard, SecretTenantAuthContext, TenantGuard};
use crate::auth::{tenant::TenantUserAuthContext, Either};

use crate::errors::ApiError;
use crate::routes::hosted::user::DecryptDocumentResult;
use crate::types::{JsonApiResponse, ResponseData};

use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::{UserVaultWrapper, UvwArgs};
use crate::State;

use api_wire_types::{
    DecryptIdentityDocumentRequest, DecryptIdentityDocumentResponse, GetIdentityDocumentForDecryptResponse,
    GetQueryParam, ImageData,
};
use db::models::scoped_user::ScopedUser;
use newtypes::{DataLifetimeKind, FootprintUserId};

use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path, web::Query};

#[api_v2_operation(
    description = "Checks existence if items in the document vault.",
    tags(Vault, PublicApi, Users)
)]
#[actix::get("/users/{footprint_user_id}/vault/identity/document")]
pub async fn get(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    // TODO: is there a way to make this typed?
    request: Query<GetQueryParam>,
    tenant_auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<GetIdentityDocumentForDecryptResponse> {
    get_internal(state, path, request, tenant_auth).await
}

pub(super) async fn get_internal(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<GetQueryParam>,
    tenant_auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<GetIdentityDocumentForDecryptResponse> {
    // TODO: DRY
    let tenant_auth = tenant_auth.check_guard(TenantGuard::Read)?;
    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let user_vault_wrapper = UserVaultWrapper::build(conn, UvwArgs::Tenant(&scoped_user.id))?;
            // Important to check requester has access
            let fields = HashSet::from_iter([DataLifetimeKind::IdentityDocument]);
            user_vault_wrapper.ensure_scope_allows_access(conn, &scoped_user, fields)?;

            Ok(user_vault_wrapper)
        })
        .await??;
    let document_types_available: HashSet<String> =
        HashSet::from_iter(available_images_from_uvw(&uvw).into_iter());
    let document_types_requested: HashSet<String> = HashSet::from_iter(
        request
            .into_inner()
            .document_types
            .map(|d| d.split(',').into_iter().map(|d| d.to_string()).collect())
            .unwrap_or_else(Vec::new)
            .into_iter(),
    );

    // If query is empty, we default to returning all available documents
    let response: GetIdentityDocumentForDecryptResponse = if document_types_requested.is_empty()
    // also catch case they added a empty query params like `?document_types=`
        || (document_types_requested.len() == 1 && document_types_requested.contains(""))
    {
        GetIdentityDocumentForDecryptResponse::from(HashMap::from_iter(
            document_types_available.iter().map(|d| (d.clone(), true)),
        ))
    } else {
        // If query is empty, we return a Map<DocTypeRequested, DocIsInVault>
        // Integration note: In practice, since documents are keyed on strings and not an enum (for now), we
        //   should advise integrators to call this without query params
        GetIdentityDocumentForDecryptResponse::from(HashMap::from_iter(
            document_types_requested
                .into_iter()
                .map(|d| (d.clone(), document_types_available.contains(&d))),
        ))
    };

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
    post_internal(state, path, request, auth, insights).await
}

pub(super) async fn post_internal(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptIdentityDocumentRequest>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
    _insights: InsightHeaders,
) -> JsonApiResponse<DecryptIdentityDocumentResponse> {
    let request = request.into_inner();
    let document_type = request.document_type;
    let auth = auth.check_guard(CanDecrypt::single(DataLifetimeKind::IdentityDocument))?;

    let footprint_user_id = path.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let (uvw, _scoped_user) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::build(conn, UvwArgs::Tenant(&scoped_user.id))?;

            // Important to check requester has access
            let fields = HashSet::from_iter([DataLifetimeKind::IdentityDocument]);
            uvw.ensure_scope_allows_access(conn, &scoped_user, fields)?;

            Ok((uvw, scoped_user))
        })
        .await??;

    // As of 2022-11-28: It's possible a user has more than 1 document of a given document_type
    let decrypted_docs: Vec<DecryptDocumentResult> =
        crate::hosted::user::decrypt_document(&state, uvw, document_type.clone()).await?;

    // TODO Create an AccessEvent log showing that the tenant accessed identity document
    /*
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: Some(request.reason),
        principal: auth.actor().into(),
        insight: CreateInsightEvent::from(insights),
        kind: AccessEventKind::Decrypt,
        targets: vec![DataIdentifier::IdentityDocument],
    }
    .save(&state.db_pool)
    .await?;
    */
    let mut image_data: Vec<ImageData> = Vec::new();
    for doc in decrypted_docs {
        image_data.push(ImageData {
            front: doc.front.leak_to_string(),
            back: doc.back.map(|p| p.leak_to_string()),
        })
    }

    let res = DecryptIdentityDocumentResponse {
        document_type,
        images: image_data,
    };

    ResponseData::ok(res).json()
}

/// Splitting out since we may in the future want to filter on things like
/// expired/is_valid etc
fn available_images_from_uvw(uvw: &UserVaultWrapper) -> Vec<String> {
    uvw.identity_documents()
        .iter()
        .map(|i| i.document_type.clone())
        .collect()
}
