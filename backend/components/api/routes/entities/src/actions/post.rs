use crate::actions::decision::apply_manual_decision;
use crate::actions::decision::clear_review;
use crate::actions::triggers::apply_trigger_request;
use crate::actions::EntityActionPostCommit;
use crate::auth::tenant::TenantSessionAuth;
use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::types::ApiListResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::headers::InsightHeaders;
use api_core::FpResult;
use api_errors::BadRequestInto;
use api_wire_types::EntityActionResponse;
use api_wire_types::EntityActionsRequest;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use newtypes::DbActor;
use newtypes::EntityAction;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    description = "Atomically apply the provided list of actions.",
    tags(EntityDetails, Entities, Private)
)]
#[post("/entities/{fp_id}/actions")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: web::Json<EntityActionsRequest>,
    auth: TenantSessionAuth,
    insight: InsightHeaders,
) -> ApiListResponse<EntityActionResponse> {
    // TODO what should the auth guard be here?
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let actor = DbActor::from(auth.actor());
    let EntityActionsRequest { actions } = request.into_inner();
    let session_key = state.session_sealing_key.clone();
    if actions.is_empty() {
        return BadRequestInto("Must provide at least one action");
    }

    let outcomes = state
        .db_transaction(move |conn| {
            let sv = ScopedVault::lock(conn, (&fp_id, &tenant_id, is_live))?;

            let outcomes = actions
                .into_iter()
                .map(|a| -> FpResult<EntityActionPostCommit> {
                    let action = match a {
                        EntityAction::Trigger(t) => {
                            apply_trigger_request(conn, t, &sv, actor.clone(), &session_key)?.into()
                        }
                        EntityAction::ClearReview => clear_review(conn, &sv, actor.clone())?,
                        EntityAction::ManualDecision(d) => apply_manual_decision(
                            conn,
                            d,
                            &sv,
                            actor.clone(),
                            insight.clone(),
                            tenant_id.clone(),
                        )?,
                    };
                    Ok(action)
                })
                .collect::<FpResult<Vec<_>>>()?;
            Ok(outcomes)
        })
        .await?;

    let responses = futures::future::join_all(outcomes.into_iter().map(|o| o.apply(&state)))
        .await
        .into_iter()
        .flatten_ok()
        .collect::<FpResult<_>>()?;
    Ok(responses)
}
