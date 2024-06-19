use crate::auth::tenant::TenantSessionAuth;
use crate::decisions::apply_manual_decision;
use crate::triggers::{
    apply_trigger_request,
    TriggerRequestOutcome,
};
use crate::State;
use api_core::auth::tenant::{
    CheckTenantGuard,
    TenantGuard,
};
use api_core::decision::review::save_review_decision;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::{
    ApiResult,
    ValidationError,
};
use api_core::task::execute_webhook_tasks;
use api_core::types::JsonApiListResponse;
use api_core::utils::fp_id_path::FpIdPath;
use api_wire_types::{
    EntityActionResponse,
    EntityActionsRequest,
};
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::{
    DbActor,
    DecisionStatus,
    EntityAction,
};
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};

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
) -> JsonApiListResponse<EntityActionResponse> {
    // TODO what should the auth guard be here?
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let actor = DbActor::from(auth.actor());
    let EntityActionsRequest { actions } = request.into_inner();
    let session_key = state.session_sealing_key.clone();
    if actions.is_empty() {
        return ValidationError("Must provide at least one action").into();
    }

    let outcomes = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let outcomes = actions
                .into_iter()
                .map(|a| -> ApiResult<EntityActionPostCommit> {
                    let action = match a {
                        EntityAction::Trigger(t) => {
                            apply_trigger_request(conn, t, &sv, actor.clone(), &session_key)?.into()
                        }
                        EntityAction::ClearReview => clear_review(conn, &sv, actor.clone())?,
                        EntityAction::ManualDecision(d) => {
                            apply_manual_decision(conn, d, &sv, actor.clone())?
                        }
                    };
                    Ok(action)
                })
                .collect::<ApiResult<Vec<_>>>()?;
            Ok(outcomes)
        })
        .await?;

    let responses = outcomes
        .into_iter()
        .map(|o| o.apply(&state))
        .flatten_ok()
        .collect::<ApiResult<_>>()?;
    Ok(responses)
}

#[derive(derive_more::From)]
pub(super) enum EntityActionPostCommit {
    Trigger(TriggerRequestOutcome),
    FireWebhooks,
}

impl EntityActionPostCommit {
    pub(super) fn apply(self, state: &State) -> ApiResult<Option<EntityActionResponse>> {
        match self {
            EntityActionPostCommit::Trigger(t) => t.post_commit(state),
            EntityActionPostCommit::FireWebhooks => {
                execute_webhook_tasks(state.clone());
                Ok(None)
            }
        }
    }
}

fn clear_review(conn: &mut TxnPgConn, sv: &ScopedVault, actor: DbActor) -> ApiResult<EntityActionPostCommit> {
    let wf = Workflow::get_active(conn, &sv.id)?.ok_or(OnboardingError::NoWorkflow)?;
    save_review_decision(conn, wf, DecisionStatus::None, None, actor)?;
    Ok(EntityActionPostCommit::FireWebhooks)
}
