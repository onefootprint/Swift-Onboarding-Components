use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::errors::tenant::TenantError;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::fingerprint::build_fingerprints;
use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;
use itertools::Itertools;
use newtypes::email::Email;
use newtypes::{
    flat_api_object_map_type, AccessEventKind, DataIdentifier, FootprintUserId, IdentityDataKind,
    IdentityDataUpdate, PiiString,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};
use std::collections::HashMap;
use std::str::FromStr;

flat_api_object_map_type!(
    PutDataRequest<DataIdentifier, PiiString>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "id.first_name": "Peter", "custom.ach_account_number": "1234567890", "custom.cc_last_4": "4242" }"#
);

#[api_v2_operation(
    description = "Updates data in a user vault. Can be used to update `id.` data or `custom.` data, but `id.` data can only be specified for user vaults created via API.",
    tags(Vault, PublicApi, Users)
)]
#[actix::put("/users/{footprint_user_id}/vault")]
pub async fn put(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<PutDataRequest>,
    tenant_auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let footprint_user_id = path.into_inner();
    let insight = CreateInsightEvent::from(insight);

    // TODO what permissions do we need to add data to vault? Any API key will be able to right now
    let tenant_auth = tenant_auth.check_guard(TenantGuard::Admin)?;
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let principal = tenant_auth.actor().into();

    let request = request.into_inner();
    let targets = request.keys().cloned().collect_vec();

    // Parse identity data
    let (mut id_update, other_data) = IdentityDataUpdate::new(request.into())?;
    let id_fingerprints = build_fingerprints(&state, id_update.clone()).await?;

    // Extract phone and email from identity data since they are handled separately (for now)
    let phone_number = id_update.remove(&IdentityDataKind::PhoneNumber);
    let email = id_update
        .remove(&IdentityDataKind::Email)
        .map(|p| Email::from_str(p.leak()))
        .transpose()?;

    // Parse custom data
    let custom_data = other_data
        .into_iter()
        .map(|(k, v)| match k {
            DataIdentifier::Custom(k) => Ok((k, v)),
            k => Err(TenantError::ValidationError(format!("Cannot put key {}", k)).into()),
        })
        .collect::<ApiResult<HashMap<_, _>>>()?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;

            let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
            uvw.put_all_data(conn, phone_number, email, id_update, id_fingerprints, custom_data)?;

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
