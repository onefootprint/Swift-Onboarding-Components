use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::auth::AuthError;
use crate::errors::ApiResult;
use crate::types::identity_data_request::{IdentityDataRequest, IdentityDataUpdate};
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::fingerprint_builder::FingerprintBuilder;
use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;
use itertools::Itertools;
use newtypes::{
    flat_api_object_map_type, AccessEventKind, FootprintUserId, IdentityDataKind, KvDataKey, PiiString,
};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

flat_api_object_map_type!(
    PutCustomDataRequest<KvDataKey, PiiString>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "ach_account_number": "1234567890", "cc_last_4": "4242" }"#
);

// TODO move this to key-value targets of DataIdentifiers.
// Would require moving validationg logic for identity data, which is also used in the bifrost API
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
    let insight = CreateInsightEvent::from(insight);

    // TODO what permissions do we need to add data to vault? Any API key will be able to right now
    let tenant_auth = tenant_auth.check_guard(TenantGuard::Admin)?;
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let principal = tenant_auth.actor().into();

    // TODO move this into one function? maybe in follow-up PR that takes in data identifiers
    let UnifiedUserVaultPutRequest { identity, custom } = request;
    let identity_update = identity.map(IdentityDataUpdate::try_from).transpose()?;
    let identity_fingerprints = if let Some(ref u) = identity_update {
        FingerprintBuilder::fingerprints(&state, u.clone()).await?
    } else {
        vec![]
    };

    let custom_targets = custom
        .as_ref()
        .map_or(vec![], |u| u.keys().cloned().map(|x| x.into()).collect_vec());
    let identity_targets = identity_fingerprints
        .iter()
        .map(|(x, _)| IdentityDataKind::from(*x))
        .map(|x| x.into());
    let targets = custom_targets.into_iter().chain(identity_targets).collect_vec();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;

            // TODO can we use the same UVW to add both kinds of data?
            if let Some(custom_update) = custom {
                let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
                uvw.update_custom_data(conn, custom_update.into())?;
            }
            if let Some(update) = identity_update {
                let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
                // Can only add identity data to a non-portable vault
                if uvw.user_vault().is_portable {
                    return Err(AuthError::CannotModifyPortableUser.into());
                }
                uvw.update_identity_data(conn, update, identity_fingerprints)?;
            }

            // Create an access event to show data was added
            NewAccessEvent {
                scoped_user_id: scoped_user.id.clone(),
                reason: None,
                principal,
                insight,
                kind: AccessEventKind::Update,
                targets,
            }
            .create(conn)?;

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
