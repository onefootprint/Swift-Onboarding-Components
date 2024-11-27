use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::State;
use db::models::business_workflow_link::BusinessWorkflowLink;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::OffsetPagination;
use itertools::Itertools;
use newtypes::WorkflowKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Gets the beneficial owners of a business entity.",
    tags(EntityDetails, Private)
)]
#[get("/entities/{fp_id}/business_owners")]
pub async fn get(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: TenantSessionAuth,
) -> ApiListResponse<api_wire_types::PrivateBusinessOwner> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();

    let (vw, mut user_decisions) = state
        .db_query(move |conn| {
            let sb = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw: TenantVw<Business> = VaultWrapper::build_for_tenant(conn, &sb.id)?;
            let (biz_wfs, _) = Workflow::list(conn, &sb.id, OffsetPagination::page(100))?;
            let biz_wf = biz_wfs
                .into_iter()
                .find(|(wf, _, _)| wf.kind == WorkflowKind::Kyb);
            let user_decisions = if let Some((biz_wf, _, _)) = biz_wf {
                BusinessWorkflowLink::get_latest_user_decisions(conn, &biz_wf.id, false)?
            } else {
                Default::default()
            };
            Ok((vw, user_decisions))
        })
        .await?;

    let decrypted_bos = vw.decrypt_business_owners(&state).await?;

    let results = decrypted_bos
        .into_iter()
        .sorted_by_key(|bo| (bo.bo.created_at))
        .map(|bo| {
            let bo_id = bo.bo.id.clone();
            (bo, &auth, user_decisions.remove(&bo_id))
        })
        .map(api_wire_types::PrivateBusinessOwner::from_db)
        .collect();
    Ok(results)
}
