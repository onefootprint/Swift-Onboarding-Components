use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::errors::tenant::TenantError;
use crate::errors::ApiResult;
use crate::types::EmptyResponse;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::utils::webhook_app::IntoWebhookApp;
use api_wire_types::CreateAnnotationRequest;
use api_wire_types::DecisionRequest;
use db::models::annotation::Annotation;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingUpdate;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::onboarding_decision::OnboardingDecisionCreateArgs;
use newtypes::DbActor;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, post, web};
use webhooks::events::WebhookEvent;

#[api_v2_operation(
    description = "Creates a new override decision for an onboarding, overriding any previous decision and clearing any outstanding manual review.",
    tags(Entities, Preview)
)]
#[post("/entities/{fp_id}/decisions")]
pub async fn post(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    request: web::Json<DecisionRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();
    let fp_id = fp_id.into_inner();
    let fp_id_clone = fp_id.clone();

    let DecisionRequest {
        annotation: CreateAnnotationRequest { note, is_pinned },
        status,
    } = request.into_inner();

    let decision = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<Option<_>> {
            let (ob, su, manual_review, decision) =
                Onboarding::lock_for_tenant(conn, &fp_id, &tenant_id, is_live)?;

            if !ob.is_complete() {
                // Can't make a decision on an onboarding that doesn't already have one
                return Err(TenantError::CannotMakeDecision.into());
            }

            let need_to_clear_manual_review = manual_review.is_some();
            // The status changed if either there is no current decision OR the status of the existing decision is different
            let status_changed = decision.map(|d| d.status != status.into()).unwrap_or(true);

            if !need_to_clear_manual_review && !status_changed {
                // The operation is a no-op
                return Ok(None);
            }
            // If a manual review will be cleared or we will create a new decision, the operation
            // is not a no-op and we should create an annotation in the DB
            let annotation = Annotation::create(conn, note, is_pinned, su.id.clone(), actor.clone())?;

            let decision = if status_changed {
                // Create a new decision if the status is different
                let new_decision = OnboardingDecisionCreateArgs {
                    vault_id: su.vault_id.clone(),
                    onboarding: &ob,
                    logic_git_hash: crate::GIT_HASH.to_string(),
                    result_ids: vec![],
                    status: status.into(),
                    annotation_id: Some(annotation.0.id),
                    actor: DbActor::from(actor.clone()),
                    seqno: None,
                };
                let decision = OnboardingDecision::create(conn, new_decision)?;
                ob.into_inner()
                    .update(conn, OnboardingUpdate::set_decision(status.into()))?;
                Some(decision)
            } else {
                // TODO should create some kind of UserTimeline event here since we are clearing a manual review
                None
            };

            // If there is an outstanding review, creating this override decision clears it
            if let Some(manual_review) = manual_review {
                manual_review.complete(conn, actor.clone(), decision.as_ref().map(|d| d.id.clone()))?;
            }

            Ok(decision.map(|d| (d, su)))
        })
        .await?;

    // notify any webhook listeners of the change
    if let Some((decision, scoped_vault)) = decision {
        state.webhook_client.send_event_to_tenant_non_blocking(
            scoped_vault.webhook_app(),
            WebhookEvent::OnboardingStatusChanged(webhooks::events::OnboardingStatusChangedPayload {
                fp_id: fp_id_clone.clone(),
                footprint_user_id: auth.tenant().uses_legacy_serialization().then_some(fp_id_clone),
                timestamp: decision.created_at,
                new_status: status.into(),
            }),
            None,
        );
    }

    EmptyResponse::ok().json()
}
