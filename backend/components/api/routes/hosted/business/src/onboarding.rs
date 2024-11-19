use crate::auth::user::UserAuthScope;
use crate::utils::headers::InsightHeaders;
use crate::State;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::session::user::TokenCreationPurpose;
use api_core::auth::session::UpdateSession;
use api_core::auth::user::UserWfAuthContext;
use api_core::types::ApiResponse;
use api_core::utils::onboarding::create_biz_wfl_if_not_exists;
use api_core::utils::onboarding::get_or_create_business_wf;
use api_core::utils::onboarding::CommonWfArgs;
use api_core::utils::onboarding::CreateBusinessWfArgs;
use api_core::utils::onboarding::ScopedVaultAction;
use api_core::web::Json;
use api_errors::BadRequestInto;
use api_wire_types::hosted::onboarding::BusinessOnboardingResponse;
use api_wire_types::PostBusinessOnboardingRequest;
use db::models::insight_event::CreateInsightEvent;
use db::models::workflow_request::WorkflowRequest;
use newtypes::WorkflowSource;
use paperclip::actix;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Gets or creates the business Onboarding, optionally accepting an existing business. You can select an existing business from the results of `GET /hosted/businesses`."
)]
#[actix::post("/hosted/business/onboarding")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    insights: InsightHeaders,
    request: Json<PostBusinessOnboardingRequest>,
) -> ApiResponse<BusinessOnboardingResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let PostBusinessOnboardingRequest {
        kyb_fixture_result,
        inherit_business_id,
    } = request.into_inner();

    let maybe_new_biz_keypair = state.enclave_client.generate_sealed_keypair().await?;

    let insight_event = CreateInsightEvent::from(insights);
    let session_key = state.session_sealing_key.clone();
    let (auth_token, is_new_sb) = state
        .db_transaction(move |conn| {
            let wfr = (user_auth.wfr_id.as_ref())
                .map(|wfr_id| WorkflowRequest::get(conn, wfr_id, &user_auth.scoped_user.id))
                .transpose()?;

            let force_create = user_auth.data.metadata.allow_reonboard;
            let common_args = CommonWfArgs {
                obc: &user_auth.ob_config,
                insight_event: Some(insight_event),
                source: WorkflowSource::Hosted,
                wfr: wfr.as_ref(),
                force_create,
                su: &user_auth.scoped_user,
            };
            let external_id = user_auth.metadata.business_external_id.clone();
            let scoped_vault_action = match (external_id, inherit_business_id) {
                (Some(external_id), None) => ScopedVaultAction::GetOrCreateExternalId(external_id),
                (None, Some(inherit_id)) => ScopedVaultAction::InheritId(inherit_id),
                (Some(_), Some(_)) => {
                    return BadRequestInto("Cannot select a business when business_external_id is set");
                }
                (None, None) => ScopedVaultAction::Create,
            };
            let args = CreateBusinessWfArgs {
                user_auth: &user_auth,
                fixture_result: kyb_fixture_result,
                scoped_vault_action,
            };
            let (biz_wf, _, is_new_sb) =
                get_or_create_business_wf(conn, common_args, maybe_new_biz_keypair, args)?;

            // Regardless of whether the business workflow is new, we might need to tie this user workflow
            // to it.
            // Note: we might tie a completed user workflow from a previous onboarding to a new business
            // workflow here, if the user is adding a second business.
            create_biz_wfl_if_not_exists(conn, &biz_wf, &user_auth.workflow)?;

            // Update auth token with new identifiers
            let args = NewUserSessionContext {
                biz_wf_id: Some(biz_wf.id),
                sb_id: Some(biz_wf.scoped_vault_id),
                ..Default::default()
            };
            let session = user_auth.update(args, vec![], TokenCreationPurpose::AddWorkflow, None)?;
            let (auth_token, _) = user_auth.create_derived(conn, &session_key, session.clone(), None)?;
            // We need to keep mutating the existing session for backwards compatibility,
            // but we should deprecate this eventually
            user_auth.update_session(conn, &session_key, session)?;
            Ok((auth_token, is_new_sb))
        })
        .await?;

    Ok(BusinessOnboardingResponse {
        auth_token,
        is_new_business: is_new_sb,
    })
}
