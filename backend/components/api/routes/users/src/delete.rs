use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::types::ApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::WriteableVw;
use db::models::audit_event::AuditEvent;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::preview_api;
use newtypes::AuditEventDetail;
use newtypes::DbActor;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;


// We really shouldn't give this API to tenants. It only soft deletes users and hides them from the
// dashboard. So there's a lot of weird behavior that's not entirely tested for users who are
// deleted this way. We should generally just encourage tenants to delete the _vault_ data for
// users. https://onefootprint.slack.com/archives/C04RHCM8FU0/p1731099510770239
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
    auth: TenantApiKeyGated<preview_api::SoftDeleteUsers>,
    insight: InsightHeaders,
) -> ApiResponse<api_wire_types::Empty> {
    let fp_id = path.into_inner();

    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let actor = auth.actor();
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    state
        .db_transaction(move |conn| -> FpResult<()> {
            let scoped_vault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: WriteableVw<Person> = VaultWrapper::lock_for_onboarding(conn, &scoped_vault.id)?;

            uvw.soft_delete_vault(conn)?;

            let insight_event_id = CreateInsightEvent::from(insight).insert_with_conn(conn)?.id;
            let actor: DbActor = actor.into();

            let event = NewAuditEvent {
                tenant_id: scoped_vault.tenant_id,
                principal_actor: actor,
                insight_event_id,
                detail: AuditEventDetail::DeleteUser {
                    is_live: scoped_vault.is_live,
                    scoped_vault_id: scoped_vault.id,
                },
            };
            AuditEvent::create(conn, event)?;

            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
