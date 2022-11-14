use crate::auth::tenant::CheckTenantPermissions;
use crate::auth::tenant::WorkOsAuthContext;
use crate::errors::tenant::TenantError;
use crate::errors::ApiResult;
use crate::types::EmptyResponse;
use crate::types::JsonApiResponse;
use crate::State;
use api_wire_types::AnnotationRequest;
use api_wire_types::DecisionRequest;
use db::models::annotation::Annotation;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingIdentifier;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::onboarding_decision::OnboardingDecisionCreateArgs;
use newtypes::{OnboardingId, TenantPermission};
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Creates a new manual decision for an onboarding, overriding any previous decision.",
    tags(Users)
)]
#[post("/onboardings/{id}/decisions")]
pub async fn post(
    state: web::Data<State>,
    onboarding_id: web::Path<OnboardingId>,
    request: web::Json<DecisionRequest>,
    auth: WorkOsAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_permissions(vec![TenantPermission::ManualReview])?;
    let tenant_id = auth.tenant().id.clone();
    let tenant_user_id = auth
        .tenant_user()
        .ok_or(TenantError::TenantUserDoesNotExist)?
        .id
        .clone();

    let DecisionRequest { annotation, status } = request.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let identifier = OnboardingIdentifier::TenantId {
                id: &onboarding_id.into_inner(),
                tenant_id: &tenant_id,
            };
            let (ob, su, _, _) = Onboarding::get(conn, identifier)?;
            let annotation = if let Some(annotation) = annotation {
                let AnnotationRequest { note, is_pinned } = annotation;
                let annotation =
                    Annotation::create(conn, note, is_pinned, su.id, Some(tenant_user_id.clone()))?;
                Some(annotation)
            } else {
                None
            };
            let new_decision = OnboardingDecisionCreateArgs {
                user_vault_id: su.user_vault_id,
                onboarding_id: ob.id,
                logic_git_hash: crate::GIT_HASH.to_string(),
                tenant_user_id: Some(tenant_user_id),
                result_ids: vec![],
                status: status.into(),
                annotation_id: annotation.map(|a| a.id),
            };
            OnboardingDecision::create(conn, new_decision)?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
