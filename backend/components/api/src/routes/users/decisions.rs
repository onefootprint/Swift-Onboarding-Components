use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::errors::ApiResult;
use crate::types::EmptyResponse;
use crate::types::JsonApiResponse;
use crate::State;
use api_wire_types::CreateAnnotationRequest;
use api_wire_types::DecisionRequest;
use db::models::annotation::Annotation;
use db::models::onboarding::Onboarding;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::onboarding_decision::OnboardingDecisionCreateArgs;
use newtypes::DbActor;
use newtypes::FootprintUserId;
use paperclip::actix::{api_v2_operation, post, web};
use webhooks::events::WebhookEvent;

#[api_v2_operation(
    description = "Creates a new override decision for an onboarding, overriding any previous decision and clearing any outstanding manual review.",
    tags(Users)
)]
#[post("/users/{fp_user_id}/decisions")]
pub async fn post(
    state: web::Data<State>,
    fp_user_id: web::Path<FootprintUserId>,
    request: web::Json<DecisionRequest>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<EmptyResponse> {
    let auth = match auth {
        Either::Left(auth) => auth.check_guard(TenantGuard::ManualReview)?,
        Either::Right(auth) => auth.has_explicitly_approved_write_permissions()?,
    };
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();
    let fp_user_id = fp_user_id.into_inner();
    let fp_user_id_clone = fp_user_id.clone();

    let DecisionRequest {
        annotation: CreateAnnotationRequest { note, is_pinned },
        status,
    } = request.into_inner();

    let decision = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<Option<_>> {
            let (ob, su, manual_review, decision) =
                Onboarding::lock_for_tenant(conn, &fp_user_id, &tenant_id, is_live)?;

            let need_to_clear_manual_review = manual_review.is_some();
            // The status changed if either there is no current decision OR the status of the existing decision is different
            let status_changed = decision.map(|d| d.status != status.into()).unwrap_or(true);

            if !need_to_clear_manual_review && !status_changed {
                // The operation is a no-op
                return Ok(None);
            }
            // If a manual review will be cleared or we will create a new decision, the operation
            // is not a no-op and we should create an annotation in the DB
            let annotation = Annotation::create(conn, note, is_pinned, su.id, actor.clone())?;

            let decision = if status_changed {
                // Create a new decision if the status is different
                let new_decision = OnboardingDecisionCreateArgs {
                    user_vault_id: su.user_vault_id,
                    onboarding: &ob,
                    logic_git_hash: crate::GIT_HASH.to_string(),
                    result_ids: vec![],
                    status: status.into(),
                    annotation_id: Some(annotation.0.id),
                    actor: DbActor::from(actor.clone()),
                    seqno: None,
                };
                let decision = OnboardingDecision::create(conn, new_decision)?;
                Some(decision)
            } else {
                // TODO should create some kind of UserTimeline event here since we are clearing a manual review
                None
            };

            // If there is an outstanding review, creating this override decision clears it
            if let Some(manual_review) = manual_review {
                manual_review.complete(conn, actor.clone(), decision.as_ref().map(|d| d.id.clone()))?;
            }

            Ok(decision)
        })
        .await?;

    // notify any webhook listeners of the change
    if let Some(decision) = decision {
        state.webhook_service_client.send_event_to_tenant_non_blocking(
            auth.tenant().id.clone(),
            WebhookEvent::OnboardingStatusChanged(webhooks::events::OnboardingStatusChangedPayload {
                footprint_user_id: fp_user_id_clone,
                timestamp: decision.created_at,
                new_status: status.into(),
            }),
            None,
        );
    }

    EmptyResponse::ok().json()
}
