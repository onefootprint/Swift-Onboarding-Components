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
use api_core::utils::requirements::get_requirements_inner;
use api_core::utils::requirements::GetRequirementsArgs;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::utils::vault_wrapper::VwArgs;
use api_wire_types::EntityValidateResponse;
use api_wire_types::TriggerKycRequest;
use db::models::liveness_event::NewLivenessEvent;
use db::models::manual_review::ManualReview;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use db::models::workflow::WorkflowUpdate;
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

    let (uvw, sv) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv.id))?;
            Ok((uvw, sv))
        })
        .await??;

    if uvw.vault.kind != VaultKind::Person {
        return Err(TenantError::IncorrectVaultKindForKyc.into());
    }
    if uvw.vault.is_portable {
        return Err(TenantError::CannotRunKycForPortable.into());
    }

    let decrypted_values = GetRequirementsArgs::get_decrypted_values(&state, &uvw).await?;

    let tenant_id = auth.tenant().id.clone();
    let wf = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
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

            let (wf_id, biz_wf) = api_core::utils::onboarding::get_or_start_onboarding(
                conn,
                None,
                false,
                &sv.vault_id,
                &sv.id,
                &obc,
                None,
                None, // currently dont support KYB for NPV
            )?;

            // TODO: consolidate with /authorize code
            let wf = Workflow::lock(conn, &wf_id)?;
            let wf = if wf.authorized_at.is_none() {
                Workflow::update(wf, conn, WorkflowUpdate::is_authorized())?
            } else {
                wf.into_inner()
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
            let reqs = get_requirements_inner(conn, uvw, args, decrypted_values)?;
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

            Ok(wf)
        })
        .await?;

    let ww = WorkflowWrapper::init(&state, wf.clone()).await?;
    if matches!(ww.state, WorkflowKind::Kyc(KycState::DataCollection(_))) {
        ww.run(&state, WorkflowActions::Authorize(Authorize {})).await?;
    } else {
        tracing::error!(workflow_id=?ww.workflow_id, wf_state=?ww.state, "[/kyc] Workflow has already been run");
    }
    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    let (wf, sv, mr) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (wf, sv) = Workflow::get_all(conn, &wf.id)?;
            let mr = ManualReview::get_active(conn, &wf.id)?;
            Ok((wf, sv, mr))
        })
        .await??;

    let status = wf.status.ok_or(OnboardingError::NoStatusForWorkflow)?;
    ResponseData::ok(api_wire_types::EntityValidateResponse::from_db((status, sv, mr))).json()
}
