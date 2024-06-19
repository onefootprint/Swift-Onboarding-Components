use crate::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use crate::types::JsonApiResponse;
use crate::State;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::kyc::KycState;
use api_core::decision::state::{
    Authorize,
    WorkflowKind,
    WorkflowWrapper,
};
use api_core::errors::onboarding::{
    OnboardingError,
    UnmetRequirements,
};
use api_core::errors::tenant::TenantError;
use api_core::errors::{
    ApiResult,
    TfError,
    ValidationError,
};
use api_core::telemetry::RootSpan;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::onboarding::NewOnboardingArgs;
use api_core::utils::requirements::{
    get_requirements_inner,
    GetRequirementsArgs,
    RequirementOpts,
};
use api_core::utils::vault_wrapper::{
    Any,
    VaultWrapper,
    VwArgs,
};
use api_wire_types::{
    EntityValidateResponse,
    SimpleFixtureResult,
    TriggerKycRequest,
};
use db::models::liveness_event::NewLivenessEvent;
use db::models::manual_review::ManualReview;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::{
    Workflow,
    WorkflowUpdate,
};
use db::DbError;
use feature_flag::BoolFlag;
use itertools::Itertools;
use newtypes::{
    CollectedDataOption,
    ObConfigurationKind,
    OnboardingRequirement,
    VaultKind,
    WorkflowSource,
};
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};

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
        force_reonboard,
    } = request.into_inner();
    let force_reonboard = force_reonboard.unwrap_or(true);
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

    // allow FF'd tenants to not collect phone + email for API-only vaults
    let allow_skipping_phone_email_reqs = state
        .ff_client
        .flag(BoolFlag::ApiKycSkipEmailAndPhoneRequirements(&tenant_id))
        && uvw.vault.is_created_via_api;

    let (wf, obc) = state
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
                force_create: force_reonboard,
                sv: &sv,
                obc: &obc,
                insight_event: None,
                new_biz_args: None, // currently dont support KYB for NPV
                source: WorkflowSource::Tenant,
                fixture_result: fixture_result.map(|fr| fr.into()),
                actor: Some(actor),
                maybe_prefill_data: None,
                // can't run neuro if using this path
                is_neuro_enabled: false,
            };
            let (wf_id, _, is_new_ob) = api_core::utils::onboarding::get_or_start_onboarding(conn, args)?;
            if !is_new_ob {
                return Err(TfError::AlreadyOnboardedToPlaybook.into());
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

            // /kyc endpoint currently does not properly handle IPK doc requirements!
            // Also does not check any requirements for the Business vault if this person is a primary BO for
            // a Business
            let reqs =
                get_requirements_inner(conn, uvw, &obc, &wf, decrypted_values, RequirementOpts::default())?;
            // TODO: consolidate with /authorize code
            let unmet_reqs = reqs
                .into_iter()
                .filter(|r| !r.is_met())
                .filter(|r| !matches!(r, OnboardingRequirement::Process))
                .filter(|r| {
                    !allow_skipping_phone_email_reqs
                        || !r.is_missing_collect_data_subset(&[
                            CollectedDataOption::Email,
                            CollectedDataOption::PhoneNumber,
                        ])
                })
                .collect_vec();
            if !unmet_reqs.is_empty() {
                let err = TfError::PlaybookMissingRequirements(
                    ObConfigurationKind::Kyc,
                    UnmetRequirements(unmet_reqs),
                );
                return Err(err.into());
            }
            Ok((wf, obc))
        })
        .await?;

    let ww = WorkflowWrapper::init(&state, wf.clone()).await?;
    if matches!(ww.state, WorkflowKind::Kyc(KycState::DataCollection(_))) {
        ww.run(&state, WorkflowActions::Authorize(Authorize {})).await?;
    } else {
        tracing::error!(workflow_id=?ww.workflow_id, wf_state=?ww.state, "[/kyc] Workflow has already been run");
    }
    let (wf, sv, mrs) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (wf, sv) = Workflow::get_all(conn, &wf.id)?;
            let mrs = ManualReview::get_active(conn, &sv.id)?;
            Ok((wf, sv, mrs))
        })
        .await?;

    Ok(api_wire_types::EntityValidateResponse::from_db((
        wf.status, sv, mrs, obc,
    )))
}
