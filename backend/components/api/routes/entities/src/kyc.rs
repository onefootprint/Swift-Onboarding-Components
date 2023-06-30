use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::Authorize;
use api_core::decision::state::WorkflowWrapper;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::tenant::TenantError;
use api_core::errors::ApiResult;
use api_core::task;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::utils::vault_wrapper::VwArgs;
use api_route_hosted::onboarding::get_requirements_inner;
use api_route_hosted::onboarding::GetRequirementsArgs;
use api_wire_types::EntityValidateResponse;
use api_wire_types::TriggerKycRequest;
use db::models::liveness_event::NewLivenessEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingUpdate;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::DbError;
use itertools::Itertools;
use newtypes::DataIdentifierDiscriminant as DID;
use newtypes::FpId;
use newtypes::OnboardingRequirement;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(description = "Trigger KYC on the provided user.", tags(Entities, Private))]
#[post("/entities/{fp_id}/kyc")]
pub async fn post(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    request: web::Json<TriggerKycRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<EntityValidateResponse> {
    let auth = auth.check_guard(TenantGuard::TriggerKyc)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let TriggerKycRequest {
        onboarding_config_key,
    } = request.into_inner();

    let ff_client = state.feature_flag_client.clone();
    let (ob_id, wf) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv.id))?;

            if uvw.vault.kind != VaultKind::Person {
                return Err(TenantError::IncorrectVaultKindForKyc.into());
            }
            if uvw.vault.is_portable {
                return Err(TenantError::CannotRunKycForPortable.into());
            }
            let (obc, tenant) = ObConfiguration::get_enabled(conn, &onboarding_config_key)
                .map_err(|_| DbError::ApiKeyNotFound)?;
            if tenant.id != tenant_id {
                Err(DbError::ApiKeyNotFound)?
            }
            let unaccessable_cdos: Vec<_> = obc
                .must_collect_data
                .clone()
                .into_iter()
                .filter(|c| !obc.can_access_data.contains(c))
                .collect();
            if !unaccessable_cdos.is_empty() {
                return Err(TenantError::MissingCanAccessCdos(unaccessable_cdos.into()).into());
            }

            let (ob, sb) = api_route_hosted::onboarding::get_or_start_onboarding(
                conn,
                &sv.vault_id,
                &sv.id,
                &obc,
                None,
                None, // currently dont support KYB for NPV
            )?;
            let ob_id = ob.id.clone();
            let wf_id = ob.workflow_id.ok_or(OnboardingError::NoWorkflow)?;
            let wf = Workflow::get(conn, &wf_id)?;

            // TODO: consolidate with /authorize code
            let ob = Onboarding::lock(conn, &ob.id)?;
            let ob = if ob.authorized_at.is_none() {
                Onboarding::update(ob, conn, OnboardingUpdate::is_authorized())?
            } else {
                ob.into_inner()
            };

            let _ = NewLivenessEvent {
                scoped_vault_id: sv.id,
                attributes: None,
                liveness_source: newtypes::LivenessSource::Skipped,
                insight_event_id: None,
            }
            .insert(conn)?;

            if obc.must_collect(DID::InvestorProfile) {
                return Err(
                    TenantError::UnsupportedObcForNpv("Investor Profile not allowed".to_owned()).into(),
                );
            }
            let reqs = get_requirements_inner(
                conn,
                uvw,
                GetRequirementsArgs {
                    ob_config: obc.clone(),
                    onboarding: ob,
                    workflow: Some(wf.clone()),
                    sb_id: sb.map(|s| s.id),
                },
                None, // /kyc endpoint currently does not properly handle IPK doc requirements!
                ff_client,
            )?;
            // TODO: consolidate with /authorize code
            let unmet_reqs = reqs
                .into_iter()
                .filter(|r| !r.is_met())
                .filter(|r| !matches!(r, OnboardingRequirement::Process))
                .collect_vec();
            if !unmet_reqs.is_empty() {
                let unmet_reqs = unmet_reqs.into_iter().map(|x| x.into()).collect_vec();
                return Err(OnboardingError::UnmetRequirements(unmet_reqs.into()).into());
            }

            Ok((ob_id, wf))
        })
        .await?;

    let ww = WorkflowWrapper::init(&state, wf.clone()).await?;
    let _res = ww.run(&state, WorkflowActions::Authorize(Authorize {})).await;

    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    let ob_info = state
        .db_pool
        .db_query(move |conn| Onboarding::get(conn, &ob_id))
        .await??;

    ResponseData::ok(api_wire_types::EntityValidateResponse::from_db(ob_info)).json()
}
