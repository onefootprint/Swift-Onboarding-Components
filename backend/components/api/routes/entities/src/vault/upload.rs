use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::tenant::{ClientTenantAuthContext, TenantAuth};
use api_core::auth::CanVault;
use api_core::utils::body_bytes::BodyBytes;
use api_core::utils::file_upload::FileUpload;
use api_core::utils::{self};
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use macros::route_alias;
use newtypes::{AccessEventKind, DataIdentifier, FpId};
use paperclip::actix::{self, api_v2_operation, web, web::Path};

/// Limit upload to ~10MB (eventually we will support a multipart upload for arbitrarily large uploads)
const TEN_MB: usize = 10 * 1024 * 1024;

#[tracing::instrument(skip(state, body))]
#[route_alias(
    actix::post(
        "/users/{fp_id}/vault/{data_identifier}/upload",
        description = "Updates data in a user vault.",
        tags(Users, Vault, PublicApi)
    ),
    actix::post(
        "/businesses/{fp_bid}/vault/{data_identifier}/upload",
        description = "Updates data in a business vault.",
        tags(Businesses, Vault, PublicApi)
    )
)]
#[api_v2_operation(
    description = "Works for either person or business entities. Updates data in a vault.",
    tags(Entities, Vault, Preview)
)]
#[actix::post("/entities/{fp_id}/vault/{data_identifier}/upload")]
pub async fn post(
    state: web::Data<State>,
    path: Path<(FpId, DataIdentifier)>,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
    body: BodyBytes<TEN_MB>,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let (fp_id, identifier) = path.into_inner();
    post_upload_inner(&state, body, auth, fp_id, identifier, insight).await
}

#[tracing::instrument(skip(state, auth, body))]
#[route_alias(actix::post(
    "/users/vault/{data_identifier}/upload",
    tags(Client, Vault, Users, PublicApi),
    description = "Updates data in a vault given a short-lived, entity-scoped client token."
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Updates data in a vault given a short-lived, entity-scoped client token.",
    tags(Client, Vault, Entities, Private)
)]
#[actix::post("/entities/vault/{data_identifier}/upload")]
pub async fn post_client(
    state: web::Data<State>,
    path: Path<DataIdentifier>,
    auth: ClientTenantAuthContext,
    insight: InsightHeaders,
    body: BodyBytes<TEN_MB>,
) -> JsonApiResponse<EmptyResponse> {
    let identifier = path.into_inner();
    let auth = auth.check_guard(CanVault::new(vec![identifier.clone()]))?;
    let fp_id = auth.fp_id.clone();
    post_upload_inner(&state, body, Box::new(auth), fp_id, identifier, insight).await
}

async fn post_upload_inner(
    state: &State,
    body: BodyBytes<TEN_MB>,
    auth: Box<dyn TenantAuth>,
    fp_id: FpId,
    data_identifier: DataIdentifier,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let insight = CreateInsightEvent::from(insight);
    let tenant_id: newtypes::TenantId = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let principal = auth.actor().into();

    // temporarily: block non custom/document objects
    match data_identifier {
        DataIdentifier::Custom(_) | DataIdentifier::Document(_) => {}
        _ => {
            return Err(api_core::ApiError::AssertionError(
                "large object upload only available for custom.* and document.* data identifiers".into(),
            ))
        }
    };

    let (vault, scoped_vault) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user: ScopedVault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vault = Vault::get(conn, &scoped_user.id)?;
            Ok((vault, scoped_user))
        })
        .await?;

    let file = FileUpload {
        bytes: body.into_inner(),
        mime_type: "application/octet-stream".into(),
        filename: data_identifier.to_string(),
        file_extension: "bin".to_string(),
    };

    let (e_data_key, s3_url) = utils::vault_wrapper::seal_file_and_upload_to_s3(
        state,
        &file,
        data_identifier.clone(),
        &vault.public_key,
        &vault.id,
        &scoped_vault.id,
    )
    .await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::lock_for_onboarding(conn, &scoped_vault.id)?;
            let doc = uvw.put_document_unsafe(
                conn,
                data_identifier.clone(),
                file.mime_type,
                file.filename,
                e_data_key,
                s3_url,
            )?;

            // Create an access event to show data was added
            NewAccessEvent {
                scoped_vault_id: scoped_vault.id,
                reason: None,
                principal,
                insight,
                kind: AccessEventKind::Update,
                targets: vec![data_identifier],
            }
            .create(conn)?;

            Ok(doc)
        })
        .await?;

    EmptyResponse::ok().json()
}
