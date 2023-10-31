use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::types::EmptyResponse;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::decision;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::ApiResult;
use api_core::errors::ValidationError;
use api_core::task;
use api_wire_types::CreateAnnotationRequest;
use api_wire_types::CreateUserDecisionRequest;
use api_wire_types::DecisionRequest;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use newtypes::FpId;
use newtypes::PreviewApi;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Creates a new manual review decision for a user, overriding any previous decision and clearing any outstanding manual review.",
    tags(Users, Preview)
)]
#[post("/users/{fp_id}/decisions")]
pub async fn post(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    request: web::Json<CreateUserDecisionRequest>,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    auth.check_preview_guard(PreviewApi::CreateUserDecision, true)?;
    // This is a kind of weird guard to use here. But ManualReview can't currently be added to API key IAM roles
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let actor = auth.actor();
    let fp_id = fp_id.into_inner();
    let CreateUserDecisionRequest { annotation, status } = request.into_inner();

    let fpid = fp_id.clone();
    let tid = tenant_id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fpid, &tid, is_live))?;
            if sv.status.is_some_and(|s| !s.has_decision()) {
                return Err(ValidationError(
                    "Cannot create a manual decision when the user's status is not already terminal",
                )
                .into());
            }
            let vault = Vault::get(conn, &sv.vault_id)?;
            if vault.kind != VaultKind::Person {
                return Err(ValidationError("Can only create a manual decision for a user").into());
            }
            // Note we don't run the workflow like we do in the entities variant
            let wf = Workflow::get_active(conn, &sv.id)?.ok_or(OnboardingError::NoWorkflow)?;
            let wf = Workflow::lock(conn, &wf.id)?;
            let request = DecisionRequest {
                annotation: CreateAnnotationRequest {
                    note: annotation,
                    is_pinned: false,
                },
                status,
            };
            decision::review::save_review_decision(conn, wf, request, actor)?;
            Ok(())
        })
        .await?;
    // Since we may have updated users onboarding status
    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    EmptyResponse::ok().json()
}
