use crate::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
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
use api_core::task;
use api_core::telemetry::RootSpan;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::requirements::{
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
    TriggerKybRequest,
};
use db::models::manual_review::ManualReview;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::{
    OnboardingWorkflowArgs,
    Workflow,
};
use db::DbError;
use itertools::Itertools;
use newtypes::{
    ObConfigurationKind,
    OnboardingRequirement,
    VaultKind,
    WorkflowFixtureResult,
    WorkflowSource,
};
use paperclip::actix::{
    api_v2_operation,
    post,
    web,
};

#[api_v2_operation(
    description = "Triggers KYB on the provided business.",
    tags(Businesses, Preview)
)]
#[post("/businesses/{fp_bid}/kyb")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: web::Json<TriggerKybRequest>,
    auth: SecretTenantAuthContext,
    root_span: RootSpan,
) -> JsonApiResponse<EntityValidateResponse> {
    let auth = auth.check_guard(TenantGuard::TriggerKyb)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let TriggerKybRequest {
        onboarding_config_key,
        key,
        fixture_result,
    } = request.into_inner();
    let fixture_result = fixture_result.map(WorkflowFixtureResult::from);
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
    if fixture_result.is_none() && !is_live {
        return Err(OnboardingError::NoFixtureResultForSandboxUser.into());
    }

    let (bvw, sb) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sb = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let bvw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sb.id))?;
            Ok((bvw, sb))
        })
        .await?;

    if bvw.vault.kind != VaultKind::Business {
        return Err(TenantError::IncorrectVaultKindForKyb.into());
    }
    // maybe relax this restriction later
    if !bvw.vault.is_created_via_api {
        return Err(TenantError::CannotRunKybForPortable.into());
    }

    let decrypted_values = GetRequirementsArgs::get_decrypted_values(&state, &bvw).await?;

    let tenant_id = auth.tenant().id.clone();
    let biz_wf = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (obc, _) = ObConfiguration::get_enabled(conn, (&key, &tenant_id, is_live))
                .map_err(|_| DbError::PlaybookNotFound)?;
            tracing::info!(playbook_key=%obc.key, "Post /kyb with playbook");
            if obc.kind != ObConfigurationKind::Kyb {
                return ValidationError("Must use playbook of kind KYB").into();
            }
            if !obc.skip_kyc {
                return ValidationError("Cannot manually trigger KYB on a playbook that requires KYC").into();
            }

            let unaccessable_cdos: Vec<_> = obc
                .must_collect_data
                .clone()
                .into_iter()
                .filter(|c| !obc.can_access_data.contains(c))
                .collect();
            if !unaccessable_cdos.is_empty() {
                // For now, require that all pieces of data are decryptable by the provided OBC.
                // Otherwise, going through KYC will cause the tenant to lose read access
                return Err(TenantError::MissingCanAccessCdos(unaccessable_cdos.into()).into());
            }

            // we currently only create WF's for Businesses at the same time that we create the Workflow for
            // the primary BO. Here we need to manually create just a business WF
            let ob_create_args = OnboardingWorkflowArgs {
                scoped_vault_id: sb.id,
                ob_configuration_id: obc.id.clone(),
                authorized: true,
                insight_event: None,
                source: WorkflowSource::Tenant,
                fixture_result,
                is_one_click: false,
                wfr: None,
                is_neuro_enabled: false,
            };
            let (biz_wf, _) = Workflow::get_or_create_onboarding(conn, ob_create_args, true)?;

            // Check requirements for this Business vault w.r.t the OBC
            let reqs = api_core::utils::requirements::get_requirements_inner(
                conn,
                bvw,
                &obc,
                &biz_wf,
                decrypted_values,
                RequirementOpts::default(),
            )?;
            // TODO: consolidate with /authorize code
            let unmet_reqs = reqs
                .into_iter()
                .filter(|r| !r.is_met())
                .filter(|r| !matches!(r, OnboardingRequirement::Process))
                .collect_vec();
            if !unmet_reqs.is_empty() {
                let err = TfError::PlaybookMissingRequirements(
                    ObConfigurationKind::Kyb,
                    UnmetRequirements(unmet_reqs),
                );
                return Err(err.into());
            }

            Ok(biz_wf)
        })
        .await?;

    api_core::utils::kyb_utils::run_kyb(&state, auth.tenant(), biz_wf.clone()).await?;
    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    let (wf, sv, mrs) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (biz_wf, biz_sv) = Workflow::get_all(conn, &biz_wf.id)?;
            let mrs = ManualReview::get_active(conn, &biz_sv.id)?;
            Ok((biz_wf, biz_sv, mrs))
        })
        .await?;

    let status = wf.status.ok_or(OnboardingError::NoStatusForWorkflow)?;
    ResponseData::ok(api_wire_types::EntityValidateResponse::from_db((status, sv, mrs))).json()
}
