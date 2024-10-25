use crate::auth::user::UserAuthScope;
use crate::utils::headers::InsightHeaders;
use crate::FpError;
use crate::State;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::session::user::TokenCreationPurpose;
use api_core::auth::session::UpdateSession;
use api_core::auth::user::UserWfAuthContext;
use api_core::types::ApiResponse;
use api_core::utils::onboarding::create_biz_wfl;
use api_core::utils::onboarding::get_or_create_business_wf;
use api_core::utils::onboarding::CommonWfArgs;
use api_core::utils::onboarding::CreateBusinessWfArgs;
use api_core::utils::onboarding::InheritBusinessId;
use api_core::web::Json;
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
        use_legacy_inherit_logic,
    } = request.into_inner();

    let maybe_new_biz_keypair = state.enclave_client.generate_sealed_keypair().await?;

    let insight_event = CreateInsightEvent::from(insights);
    let session_key = state.session_sealing_key.clone();
    let auth_token = state
        .db_transaction(move |conn| -> Result<_, FpError> {
            let wfr = (user_auth.wfr_id.as_ref())
                .map(|wfr_id| WorkflowRequest::get(conn, wfr_id, &user_auth.scoped_user.id))
                .transpose()?;

            // TODO: how should force_create on the playbook work when inheriting a business?
            // maybe we won't really need the playbook setting anymore - the default behavior will support
            // making a _new_ business, but we never allow reonboarding a business just via playbook key
            let force_create = user_auth.data.allow_reonboard || user_auth.ob_config.allow_reonboard;
            let common_args = CommonWfArgs {
                obc: &user_auth.ob_config,
                insight_event: Some(insight_event),
                source: WorkflowSource::Hosted,
                wfr: wfr.as_ref(),
                force_create,
                su: &user_auth.scoped_user,
            };
            let inherit_business_id = if use_legacy_inherit_logic {
                InheritBusinessId::Legacy
            } else {
                InheritBusinessId::Modern(inherit_business_id)
            };
            let args = CreateBusinessWfArgs {
                user_auth: &user_auth,
                fixture_result: kyb_fixture_result,
                inherit_business_id,
            };
            let (biz_wf, is_new_wf) =
                get_or_create_business_wf(conn, common_args, maybe_new_biz_keypair, args)?;

            if is_new_wf {
                // Note: we might tie a completed user workflow from a previous onboarding to a new business
                // workflow here, if the user is adding a second business.
                create_biz_wfl(conn, &biz_wf, &user_auth.workflow)?;
            }

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
            Ok(auth_token)
        })
        .await?;

    Ok(BusinessOnboardingResponse { auth_token })
}
