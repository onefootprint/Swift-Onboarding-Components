use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantApiKeyAuth;
use crate::auth::tenant::TenantGuard;
use crate::types::ApiResponse;
use crate::State;
use api_core::errors::onboarding::OnboardingError;
use api_core::errors::onboarding::UnmetRequirements;
use api_core::errors::tenant::TenantError;
use api_core::errors::TfError;
use api_core::task;
use api_core::telemetry::RootSpan;
use api_core::utils::db2api::DbToApi;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::requirements::get_requirements_for_wf;
use api_core::utils::requirements::RequirementContext;
use api_core::utils::requirements::RequirementOpts;
use api_core::utils::requirements::UserDecryptResultForReqs;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_errors::BadRequest;
use api_errors::BadRequestInto;
use api_errors::FpDbOptionalExtension;
use api_wire_types::EntityValidateResponse;
use api_wire_types::TriggerKybRequest;
use db::models::data_lifetime::DataLifetime;
use db::models::manual_review::ManualReview;
use db::models::manual_review::ManualReviewFilters;
use db::models::playbook::Playbook;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::OnboardingWorkflowArgs;
use db::models::workflow::Workflow;
use db::DbError;
use itertools::Itertools;
use newtypes::BusinessDataKind;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::ObConfigurationKind;
use newtypes::OnboardingRequirement;
use newtypes::VaultKind;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowSource;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    description = "For a user and business whose information have already been collected, runs the verification checks of the provided playbook. This will contact the identity and business verification vendors configured on your playbook and issue a decision using the rules defined on your playbook.",
    tags(Businesses, Preview)
)]
#[post("/businesses/{fp_bid}/kyb")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    request: web::Json<TriggerKybRequest>,
    auth: TenantApiKeyAuth,
    root_span: RootSpan,
) -> ApiResponse<web::Json<EntityValidateResponse>> {
    let auth = auth.check_guard(TenantGuard::TriggerKyb)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let TriggerKybRequest {
        onboarding_config_key,
        key,
        fixture_result,
        allow_reonboard,
    } = request.into_inner();
    let allow_reonboard = allow_reonboard.unwrap_or(true);
    let fixture_result = fixture_result.map(WorkflowFixtureResult::from);
    // For backwards compatibility
    match onboarding_config_key {
        Some(_) => root_span.record("meta", "with_legacy_onboarding_key"),
        None => root_span.record("meta", "with_modern_key"),
    };
    let key = key
        .or(onboarding_config_key)
        .ok_or(BadRequest("Missing required field key"))?;

    if fixture_result.is_some() && is_live {
        return Err(OnboardingError::CannotCreateFixtureResultForNonSandbox.into());
    }
    if fixture_result.is_none() && !is_live {
        return Err(OnboardingError::NoFixtureResultForSandboxUser.into());
    }

    let (bvw, sb, seqno) = state
        .db_query(move |conn| {
            let seqno = DataLifetime::get_current_seqno(conn)?;

            let sb = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let bvw = VaultWrapper::<Business>::build_for_tenant_version(conn, &sb.id, seqno)?;
            Ok((bvw, sb, seqno))
        })
        .await?;
    if bvw.vault.kind != VaultKind::Business {
        return Err(TenantError::IncorrectVaultKindForKyb.into());
    }
    // maybe relax this restriction later
    if !bvw.vault.is_created_via_api {
        return Err(TenantError::CannotRunKybForPortable.into());
    }

    // fetch country code and validate is US
    let is_us_country_code = bvw
        .decrypt_unchecked_single(&state.enclave_client, BusinessDataKind::Country.into())
        .await?
        .and_then(|country_code_str| country_code_str.parse_into::<Iso3166TwoDigitCountryCode>().ok())
        .map(|country_code| country_code.is_us())
        .unwrap_or(false);

    let dbos = bvw.decrypt_business_owners(&state).await?;
    let tenant_id = auth.tenant().id.clone();
    let (biz_wf, obc) = state
        .db_transaction(move |conn| {
            let result = Playbook::get_latest_version_if_enabled(conn, (&key, &tenant_id, is_live));
            let (playbook, obc) = match result.optional() {
                Ok(Some((playbook, obc, _))) => (playbook, obc),
                Ok(None) => return Err(DbError::PlaybookNotFound.into()),
                Err(e) => return Err(e),
            };
            tracing::info!(playbook_key=%obc.key, "Post /kyb with playbook");
            if obc.kind != ObConfigurationKind::Kyb {
                return BadRequestInto("Must use playbook of kind KYB");
            }
            if !obc.verification_checks().skip_kyc() {
                return BadRequestInto("Cannot manually trigger KYB on a playbook that requires KYC");
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
            let (biz_wf, _) = Workflow::get_or_create_onboarding(conn, ob_create_args, allow_reonboard)?;

            // Check requirements for this Business vault w.r.t the OBC
            let ctx = RequirementContext {
                user_values: &UserDecryptResultForReqs::empty(),
                business_owners: &dbos,
                auth_events: &[],
                is_secondary_bo: false,
                playbook: &playbook,
                obc: &obc,
                opts: RequirementOpts::default(),
            };
            let reqs = get_requirements_for_wf(conn, ctx, &biz_wf, &bvw)?;
            // TODO: consolidate with /authorize code
            let unmet_reqs = reqs
                .into_iter()
                .filter(|r| !r.is_met())
                .filter(|r| !matches!(r, OnboardingRequirement::Process))
                .filter(|r| !matches!(r, OnboardingRequirement::RegisterAuthMethod { .. }))
                .collect_vec();
            if !unmet_reqs.is_empty() {
                let err = TfError::PlaybookMissingRequirements(
                    ObConfigurationKind::Kyb,
                    UnmetRequirements(unmet_reqs),
                );
                return Err(err.into());
            }

            if !is_us_country_code {
                return Err(TenantError::ValidationError(
                    "Cannot trigger KYB for businesses with non-US addresses".into(),
                )
                .into());
            }

            Ok((biz_wf, obc))
        })
        .await?;

    let tenant = auth.tenant();
    let biz_wf_id = biz_wf.id.clone();
    api_core::utils::kyb_utils::progress_business_workflow(&state, None, tenant, biz_wf_id, seqno, false)
        .await?;
    task::execute_webhook_tasks((*state.clone().into_inner()).clone());

    let (wf, sv, mrs) = state
        .db_query(move |conn| {
            let (biz_wf, biz_sv) = Workflow::get_all(conn, &biz_wf.id)?;
            let mr_filters = ManualReviewFilters::get_active();
            let mrs = ManualReview::get(conn, &biz_sv.id, mr_filters)?;
            Ok((biz_wf, biz_sv, mrs))
        })
        .await?;

    Ok(web::Json(api_wire_types::EntityValidateResponse::from_db((
        wf.status, sv, mrs, obc,
    ))))
}
