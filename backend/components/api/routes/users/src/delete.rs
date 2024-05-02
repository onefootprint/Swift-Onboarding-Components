use crate::{
    auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard},
    errors::ApiResult,
    types::JsonApiResponse,
    utils::vault_wrapper::VaultWrapper,
    State,
};
use api_core::{
    types::{EmptyResponse, ResponseData},
    utils::{
        fp_id_path::FpIdPath,
        headers::InsightHeaders,
        vault_wrapper::{Person, WriteableVw},
    },
};
use db::models::{audit_event::NewAuditEvent, insight_event::CreateInsightEvent, scoped_vault::ScopedVault};
use macros::route_alias;
use newtypes::{AuditEventDetail, AuditEventId, DbActor};
use paperclip::actix::{self, api_v2_operation, web};

#[route_alias(actix::delete(
    "/businesses/{fp_bid}",
    tags(Businesses, Deprecated),
    description = "Deletes a business."
))]
#[api_v2_operation(description = "Deletes a user.", tags(Users, Deprecated))]
#[actix::delete("/users/{fp_id:fp_[_A-Za-z0-9]*}")]
pub async fn delete(
    state: web::Data<State>,
    path: FpIdPath,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let fp_id = path.into_inner();

    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let actor = auth.actor();
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<()> {
            let scoped_vault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &scoped_vault.id)?;

            uvw.soft_delete_vault(conn)?;

            let insight_event_id = CreateInsightEvent::from(insight).insert_with_conn(conn)?.id;
            let actor: DbActor = actor.into();

            // n.b. There is no access event type for a deleted user, not adding one since we're
            // mid-migration.
            NewAuditEvent {
                id: AuditEventId::generate(),
                tenant_id: scoped_vault.tenant_id,
                principal_actor: actor,
                insight_event_id,
                detail: AuditEventDetail::DeleteUser {
                    is_live: scoped_vault.is_live,
                    scoped_vault_id: scoped_vault.id,
                },
            }
            .create(conn)?;

            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
