use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::kyc::KycState;
use api_core::decision::state::Authorize;
use api_core::decision::state::WorkflowKind;
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

#[api_v2_operation(description = "Trigger KYC on the provided user.", tags(Entities, Preview))]
#[post("/entities/{fp_id}/kyc")]
pub async fn post(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    request: web::Json<TriggerKycRequest>,
    auth: SecretTenantAuthContext,
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

            let (ob, wf, biz_wf) = api_core::utils::onboarding::get_or_start_onboarding(
                conn,
                &sv.vault_id,
                &sv.id,
                &obc,
                None,
                None, // currently dont support KYB for NPV
            )?;
            let ob_id = ob.id.clone();

            // TODO: consolidate with /authorize code
            let ob = Onboarding::lock(conn, &ob.id)?;
            let wf = if ob.authorized_at.is_none() {
                Onboarding::update(ob, conn, Some(&wf.id), OnboardingUpdate::is_authorized())?;
                Workflow::get(conn, &wf.id)? // refresh from DB
            } else {
                wf
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
            let args = GetRequirementsArgs {
                ob_config: obc.clone(),
                workflow: wf.clone(),
                sb_id: biz_wf.map(|ob| ob.scoped_vault_id),
            };
            // /kyc endpoint currently does not properly handle IPK doc requirements!
            let reqs = get_requirements_inner(conn, uvw, args, None, ff_client)?;
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
    if matches!(ww.state, WorkflowKind::Kyc(KycState::DataCollection(_))) {
        ww.run(&state, WorkflowActions::Authorize(Authorize {})).await?;
    } else {
        tracing::warn!(workflow_id=?ww.workflow_id, wf_state=?ww.state, "[/kyc] Workflow has already been run");
    }
    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    let (ob_info, wf) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let ob_info = Onboarding::get(conn, &ob_id)?;
            let wf = Workflow::get(conn, &wf.id)?;
            Ok((ob_info, wf))
        })
        .await??;

    ResponseData::ok(api_wire_types::EntityValidateResponse::from_db((
        ob_info,
        Some(wf),
    )))
    .json()
}
