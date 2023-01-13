use super::custom::{self, PutCustomDataRequest};
use super::identity::{self};
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantAuth;
use crate::types::identity_data_request::{IdentityDataRequest, IdentityDataUpdate};
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::fingerprint_builder::FingerprintBuilder;
use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;
use newtypes::FootprintUserId;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct UnifiedUserVaultPutRequest {
    /// identity data
    identity: Option<IdentityDataRequest>,
    /// custom data fields
    custom: Option<PutCustomDataRequest>,
}

#[api_v2_operation(
    description = "Updates data in the identity vault.",
    tags(Vault, PublicApi, Users)
)]
#[actix::put("/users/{footprint_user_id}/vault")]
pub async fn put(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<UnifiedUserVaultPutRequest>,
    tenant_auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let request = request.into_inner();

    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let insight = CreateInsightEvent::from(insight);

    let (update, fingerprints) = if let Some(identity) = request.identity {
        let update = IdentityDataUpdate::try_from(identity)?;
        let fingerprints = FingerprintBuilder::fingerprints(&state, update.clone()).await?;
        (Some(update), fingerprints)
    } else {
        (None, vec![])
    };

    // NOTE: these operations on the different parts of the user vault must be atomic
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;

            // TODO can we use the same UVW to add both kinds of data?
            if let Some(custom_update) = request.custom {
                let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
                custom::put_internal(
                    conn,
                    uvw,
                    &tenant_auth,
                    &scoped_user,
                    insight.clone(),
                    custom_update,
                )?;
            }
            if let Some(update) = update {
                let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
                identity::put_internal(
                    conn,
                    uvw,
                    &tenant_auth,
                    &scoped_user,
                    insight,
                    update,
                    fingerprints,
                )?
            }

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
