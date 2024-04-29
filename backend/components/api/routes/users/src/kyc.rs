use crate::{
    auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard},
    types::{response::ResponseData, JsonApiResponse},
    State,
};
use api_core::{
    decision::state::{actions::WorkflowActions, kyc::KycState, Authorize, WorkflowKind, WorkflowWrapper},
    errors::{onboarding::OnboardingError, tenant::TenantError, ApiResult, ValidationError},
    task,
    telemetry::RootSpan,
    utils::{
        db2api::DbToApi,
        fp_id_path::FpIdPath,
        onboarding::NewOnboardingArgs,
        requirements::{get_requirements_inner, GetRequirementsArgs, RequirementOpts},
        vault_wrapper::{Any, VaultWrapper, VwArgs},
    },
};
use api_wire_types::{EntityValidateResponse, SimpleFixtureResult, TriggerKycRequest};
use db::{
    models::{
        liveness_event::NewLivenessEvent,
        manual_review::ManualReview,
        ob_configuration::ObConfiguration,
        scoped_vault::ScopedVault,
        workflow::{Workflow, WorkflowUpdate},
    },
    DbError,
};
use itertools::Itertools;
use newtypes::{
    DataIdentifierDiscriminant as DID, ObConfigurationKind, OnboardingRequirement, VaultKind, WorkflowSource,
};
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(description = "Trigger KYC on the provided user.", tags(Users, Preview))]
#[post("/users/{fp_id}/kyc")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: web::Json<TriggerKycRequest>,
    auth: SecretTenantAuthContext,
    root_span: RootSpan,
) -> JsonApiResponse<EntityValidateResponse> {
    let auth = auth.check_guard(TenantGuard::TriggerKyc)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let TriggerKycRequest {
        onboarding_config_key,
        key,
        fixture_result,
    } = request.into_inner();
    // For backwards compatibility
    match onboarding_config_key {
        Some(_) => root_span.record("meta", "with_legacy_onboarding_key"),
        None => root_span.record("meta", "with_modern_key"),
    };
    let key = key
        .or(onboarding_config_key)
        .ok_or(ValidationError("Missing required field key"))?;
    if fixture_result.is_some() && is_live {
        return Err(OnboardingError::CannotCreateFixtureResultForNonSandbox.into());
    }
    let fixture_result = if fixture_result.is_none() && !is_live {
        // Eventually error here, but apiture was doing some POC testing and they weren't providing
        // a fixture result
        Some(SimpleFixtureResult::Pass)
    } else {
        fixture_result
    };

    let (uvw, sv) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sv.id))?;
            Ok((uvw, sv))
        })
        .await?;

    if uvw.vault.kind != VaultKind::Person {
        return Err(TenantError::IncorrectVaultKindForKyc.into());
    }
    if !uvw.vault.is_created_via_api {
        return Err(TenantError::CannotRunKycForPortable.into());
    }

    let decrypted_values = GetRequirementsArgs::get_decrypted_values(&state, &uvw).await?;

    let tenant_id = auth.tenant().id.clone();
    let actor = auth.actor();
    let wf = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (obc, _) = ObConfiguration::get_enabled(conn, (&key, &tenant_id, is_live))
                .map_err(|_| DbError::PlaybookNotFound)?;
            tracing::info!(playbook_key=%obc.key, "Post /kyc with playbook");
            if obc.kind != ObConfigurationKind::Kyc {
                return Err(ValidationError("Must use playbook of kind KYC").into());
            }

            let unaccessable_cdos: Vec<_> = obc
                .must_collect_data
                .clone()
                .into_iter()
                .filter(|c| !obc.can_access_data.contains(c))
                .collect();
            if !unaccessable_cdos.is_empty() {
                // For now, require that all pieces of data are decryptable by the provided OBC.
                // Otherwise, going through KYC will cause the tenant to lose read access.
                return Err(TenantError::MissingCanAccessCdos(unaccessable_cdos.into()).into());
            }

            let args = NewOnboardingArgs {
                existing_wf_id: None,
                wfr_id: None,
                force_create: false,
                sv: &sv,
                obc: &obc,
                insight_event: None,
                new_biz_args: None, // currently dont support KYB for NPV
                source: WorkflowSource::Tenant,
                actor: Some(actor),
                maybe_prefill_data: None,
                // can't run neuro if using this path
                is_neuro_enabled: false,
            };
            let (wf_id, _) = api_core::utils::onboarding::get_or_start_onboarding(conn, args)?;
            if let Some(fixture_result) = fixture_result {
                Workflow::update_fixture_result(conn, &wf_id, fixture_result.into())?;
            }

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
                skip_context: None,
            }
            .insert(conn)?;

            if obc.must_collect(DID::InvestorProfile) {
                return Err(
                    TenantError::UnsupportedObcForNpv("Investor Profile not allowed".to_owned()).into(),
                );
            }

            // /kyc endpoint currently does not properly handle IPK doc requirements!
            // Also does not check any requirements for the Business vault if this person is a primary BO for a Business
            let reqs =
                get_requirements_inner(conn, uvw, &obc, &wf, decrypted_values, RequirementOpts::default())?;
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

    let (wf, sv, mrs) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (wf, sv) = Workflow::get_all(conn, &wf.id)?;
            let mrs = ManualReview::get_active(conn, &sv.id)?;
            Ok((wf, sv, mrs))
        })
        .await?;

    let status = wf.status.ok_or(OnboardingError::NoStatusForWorkflow)?;
    ResponseData::ok(api_wire_types::EntityValidateResponse::from_db((status, sv, mrs))).json()
}
