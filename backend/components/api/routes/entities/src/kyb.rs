use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::tenant::TenantError;
use api_core::errors::ApiResult;
use api_core::task;
use api_core::utils::db2api::DbToApi;
use api_core::utils::requirements::GetRequirementsArgs;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::utils::vault_wrapper::VwArgs;
use api_wire_types::EntityValidateResponse;
use api_wire_types::TriggerKybRequest;
use db::models::manual_review::ManualReview;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::OnboardingWorkflowArgs;
use db::models::workflow::Workflow;
use db::DbError;
use itertools::Itertools;
use newtypes::FpId;
use newtypes::OnboardingRequirement;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Trigger KYB on the provided business.",
    tags(Entities, Preview)
)]
#[post("/businesses/{fp_id}/kyb")]
pub async fn post(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    request: web::Json<TriggerKybRequest>,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<EntityValidateResponse> {
    let auth = auth.check_guard(TenantGuard::TriggerKyb)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let TriggerKybRequest {
        onboarding_config_key,
        fixture_result, // TODO: could technically restrict this to not allow stepup?
    } = request.into_inner();

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
        .await??;

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

            // we currently only create WF's for Businesses at the same time that we create the Workflow for the primary BO. Here we need to manually create just a business WF
            let ob_create_args = OnboardingWorkflowArgs {
                scoped_vault_id: sb.id,
                ob_configuration_id: obc.id.clone(),
                authorized: true,
                insight_event: None,
            };
            let (biz_wf, _) =
                Workflow::get_or_create_onboarding(conn, ob_create_args, fixture_result, false)?;

            // Check requirements for this Business vault w.r.t the OBC
            let reqs = api_core::utils::requirements::get_requirements_inner(
                conn,
                bvw,
                &obc,
                &biz_wf,
                decrypted_values,
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

            Ok(biz_wf)
        })
        .await?;

    api_core::utils::kyb_utils::run_kyb(&state, auth.tenant(), biz_wf.clone()).await?;
    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    let (wf, sv, mr) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (wf, sv) = Workflow::get_all(conn, &biz_wf.id)?;
            let mr = ManualReview::get_active(conn, &biz_wf.id)?;
            Ok((wf, sv, mr))
        })
        .await??;

    let status = wf.status.ok_or(OnboardingError::NoStatusForWorkflow)?;
    ResponseData::ok(api_wire_types::EntityValidateResponse::from_db((status, sv, mr))).json()
}
