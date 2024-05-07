use crate::{
    auth::tenant::{SecretTenantAuthContext, TenantGuard},
    errors::ApiResult,
    types::{EmptyResponse, JsonApiResponse},
    utils::{headers::InsightHeaders, vault_wrapper::VaultWrapper},
    State,
};
use api_core::{
    api_headers_schema,
    auth::{
        tenant::{CheckTenantGuard, ClientTenantAuthContext, TenantAuth, TenantSessionAuth},
        CanVault, Either,
    },
    utils::{self, body_bytes::BodyBytes, file_upload::FileUpload, vault_wrapper::NewDocument},
};
use db::models::{
    access_event::NewAccessEventRow, audit_event::NewAuditEvent, insight_event::CreateInsightEvent,
    scoped_vault::ScopedVault, vault::Vault,
};
use macros::route_alias;
use newtypes::{
    AccessEventKind, AccessEventPurpose, AuditEventDetail, AuditEventId, DataIdentifier, DbActor,
    DocumentDiKind, FpId, PiiBytes,
};
use paperclip::actix::{self, api_v2_operation, web, web::Path};

api_headers_schema! {
    pub struct UploadHeaderParams {
        required: {}

        optional: {
            /// Specify the content type of the object like `application/json` or `image/png`
            mime_type: String = "content-type";
        }
    }
}

/// Limit upload to ~10MB (eventually we will support a multipart upload for arbitrarily large uploads)
const TEN_MB: usize = 10 * 1024 * 1024;

#[tracing::instrument(skip(state, body))]
#[route_alias(
    actix::post(
        "/users/{fp_id}/vault/{identifier}/upload",
        description = "Updates data in a user vault.",
        tags(Users, Vault, PublicApi)
    ),
    actix::post(
        "/businesses/{fp_bid}/vault/{identifier}/upload",
        description = "Updates data in a business vault.",
        tags(Businesses, Vault, Private)
    )
)]
#[api_v2_operation(
    description = "Works for either person or business entities. Updates data in a vault.",
    tags(Vault, Entities, Private)
)]
#[actix::post("/entities/{fp_id}/vault/{identifier}/upload")]
pub async fn post(
    state: web::Data<State>,
    path: Path<(FpId, DataIdentifier)>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insight: InsightHeaders,
    headers: UploadHeaderParams,
    body: BodyBytes<TEN_MB>,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let (fp_id, identifier) = path.into_inner();
    post_upload_inner(&state, body, headers, auth, fp_id, identifier, insight).await
}

#[tracing::instrument(skip(state, auth, body))]
#[route_alias(actix::post(
    "/users/vault/{identifier}/upload",
    tags(Client, Vault, Users, PublicApi),
    description = "Updates data in a vault given a short-lived, entity-scoped client token."
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Updates data in a vault given a short-lived, entity-scoped client token.",
    tags(Client, Vault, Entities, Private)
)]
#[actix::post("/entities/vault/{identifier}/upload")]
pub async fn post_client(
    state: web::Data<State>,
    path: Path<DataIdentifier>,
    auth: ClientTenantAuthContext,
    insight: InsightHeaders,
    body: BodyBytes<TEN_MB>,
    headers: UploadHeaderParams,
) -> JsonApiResponse<EmptyResponse> {
    let identifier = path.into_inner();
    let auth = auth.check_guard(CanVault::new(vec![identifier.clone()]))?;
    let fp_id = auth.fp_id.clone();
    post_upload_inner(&state, body, headers, Box::new(auth), fp_id, identifier, insight).await
}

async fn post_upload_inner(
    state: &State,
    body: BodyBytes<TEN_MB>,
    headers: UploadHeaderParams,
    auth: Box<dyn TenantAuth>,
    fp_id: FpId,
    di: DataIdentifier,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let insight = CreateInsightEvent::from(insight);
    let tenant_id: newtypes::TenantId = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let principal: DbActor = auth.actor().into();
    let source = auth.dl_source();

    // temporarily: block non custom/document objects
    match di {
        DataIdentifier::Custom(_) | DataIdentifier::Document(_) => {}
        _ => {
            return Err(api_core::ApiErrorKind::AssertionError(
                "large object upload only available for custom.* and document.* data identifiers".into(),
            ))?
        }
    };

    let (vault, scoped_vault) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_vault: ScopedVault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vault = Vault::get(conn, &scoped_vault.id)?;
            Ok((vault, scoped_vault))
        })
        .await?;

    let mime_type = headers.mime_type.unwrap_or("application/octet-stream".into());
    let image_bytes = PiiBytes::new(body.into_inner().to_vec());
    let file = FileUpload::new_simple(image_bytes, format!("{}", di), &mime_type);

    let (e_data_key, s3_url) =
        utils::vault_wrapper::seal_file_and_upload_to_s3(state, &file, &di, &vault, &scoped_vault.id).await?;

    // TODO make a timeline event here
    let actor = auth.actor();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::lock_for_onboarding(conn, &scoped_vault.id)?;
            let doc = NewDocument {
                kind: di.clone(),
                mime_type: file.mime_type,
                filename: file.filename,
                e_data_key,
                s3_url,
                source,
            };
            let derived_doc = if let DataIdentifier::Document(DocumentDiKind::Image(kind, side)) = di {
                // Derive latest_upload DI if the image is vaulted
                let latest_upload_kind = DocumentDiKind::LatestUpload(kind, side).into();
                Some(NewDocument {
                    filename: format!("{}", latest_upload_kind),
                    kind: latest_upload_kind,
                    mime_type: doc.mime_type.clone(),
                    e_data_key: doc.e_data_key.clone(),
                    s3_url: doc.s3_url.clone(),
                    source: doc.source,
                })
            } else {
                None
            };
            let docs = vec![Some(doc), derived_doc].into_iter().flatten().collect();
            let doc = uvw.put_documents_unsafe(conn, docs, Some(actor), true)?;

            let insight_event_id = insight.insert_with_conn(conn)?.id;

            // Create an access event to show data was added
            let aeid = AuditEventId::generate();
            NewAccessEventRow {
                id: aeid.clone().into_correlated_access_event_id(),
                scoped_vault_id: scoped_vault.id.clone(),
                tenant_id: scoped_vault.tenant_id.clone(),
                is_live: scoped_vault.is_live,
                reason: None,
                principal: principal.clone(),
                insight_event_id: insight_event_id.clone(),
                kind: AccessEventKind::Update,
                targets: vec![di.clone()],
                purpose: AccessEventPurpose::Api,
            }
            .create(conn)?;

            NewAuditEvent {
                id: aeid,
                tenant_id: scoped_vault.tenant_id,
                principal_actor: principal,
                insight_event_id,
                detail: AuditEventDetail::UpdateUserData {
                    is_live: scoped_vault.is_live,
                    scoped_vault_id: scoped_vault.id,
                    updated_fields: vec![di],
                },
            }
            .create(conn)?;

            Ok(doc)
        })
        .await?;

    EmptyResponse::ok().json()
}
