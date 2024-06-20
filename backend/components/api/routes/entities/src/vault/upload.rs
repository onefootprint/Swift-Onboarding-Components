use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::errors::ApiResult;
use crate::types::ModernApiResult;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::api_headers_schema;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::ClientTenantAuthContext;
use api_core::auth::tenant::TenantAuth;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::CanVault;
use api_core::auth::Either;
use api_core::utils::body_bytes::BodyBytes;
use api_core::utils::file_upload::FileUpload;
use api_core::utils::vault_wrapper::NewDocument;
use api_core::utils::{
    self,
};
use db::models::access_event::NewAccessEventRow;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use macros::route_alias;
use newtypes::AccessEventKind;
use newtypes::AccessEventPurpose;
use newtypes::AuditEventDetail;
use newtypes::AuditEventId;
use newtypes::DataIdentifier;
use newtypes::DbActor;
use newtypes::DocumentDiKind;
use newtypes::FpId;
use newtypes::PiiBytes;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Path;
use paperclip::actix::{
    self,
};

api_headers_schema! {
    pub struct UploadHeaderParams {
        required: {}

        optional: {
            /// Specify the content type of the object like `application/json` or `image/png`
            mime_type: String = "content-type";
        }
    }
}

/// Limit upload to ~10MB (eventually we will support a multipart upload for arbitrarily large
/// uploads)
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
) -> ModernApiResult<api_wire_types::Empty> {
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
) -> ModernApiResult<api_wire_types::Empty> {
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
) -> ModernApiResult<api_wire_types::Empty> {
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

    Ok(api_wire_types::Empty)
}
