//! Add identity data to a NON-portable user vault

use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::{tenant::TenantAuth, AuthError};
use crate::errors::ApiResult;
use crate::types::identity_data_request::{IdentityDataRequest, IdentityDataUpdate};
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::fingerprint_builder::FingerprintBuilder;
use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::LockedTenantUvw;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::utils::user_vault_wrapper::UvwAddData;
use crate::{errors::ApiError, State};
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;
use db::TxnPgConnection;
use newtypes::{AccessEventKind, DataIdentifier, Fingerprint, FootprintUserId, UvdKind};
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

#[api_v2_operation(
    description = "Updates data in the user's identity vault.",
    tags(Vault, PublicApi, Users)
)]
#[actix::put("/users/{footprint_user_id}/vault/identity")]
pub async fn put(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<IdentityDataRequest>,
    tenant_auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let request = request.into_inner();
    let update = IdentityDataUpdate::try_from(request)?;
    let fingerprints = FingerprintBuilder::fingerprints(&state, update.clone()).await?;
    let insight = CreateInsightEvent::from(insight);

    state
        .db_pool
        .db_transaction(move |conn| -> Result<(), ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
            put_internal(
                conn,
                uvw,
                &tenant_auth,
                &scoped_user,
                insight,
                update,
                fingerprints,
            )?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}

pub fn put_internal(
    conn: &mut TxnPgConnection,
    uvw: LockedTenantUvw,
    tenant_auth: &SecretTenantAuthContext,
    scoped_user: &ScopedUser,
    insight: CreateInsightEvent,
    update: IdentityDataUpdate,
    fingerprints: Vec<(UvdKind, Fingerprint)>,
) -> ApiResult<()> {
    if uvw.user_vault().is_portable {
        return Err(AuthError::CannotModifyPortableUser.into());
    }

    // Create an AccessEvent log showing that the tenant updated these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: None,
        principal: tenant_auth.actor().into(),
        insight,
        kind: AccessEventKind::Update,
        targets: fingerprints
            .iter()
            .map(|fp| fp.0.into())
            .map(DataIdentifier::Id)
            .collect(),
    }
    .create(conn)?;
    uvw.update_identity_data(conn, update, fingerprints)?;

    Ok(())
}
