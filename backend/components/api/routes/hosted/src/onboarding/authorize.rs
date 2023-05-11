use crate::auth::user::UserAuthGuard;
use crate::business::utils::send_secondary_bo_links;
use crate::decision;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::onboarding::get_requirements;
use crate::types::response::ResponseData;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::State;
use api_core::auth::user::UserObAuthContext;
use api_core::auth::user::UserObSession;
use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use api_core::types::EmptyResponse;
use api_core::types::JsonApiResponse;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::DecryptedBusinessOwners;
use api_core::utils::vault_wrapper::Person;
use api_core::utils::vault_wrapper::TenantVw;
use api_wire_types::hosted::onboarding_requirement::OnboardingRequirement;
use chrono::Utc;
use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingUpdate;
use db::models::tenant::Tenant;
use itertools::Itertools;
use newtypes::OnboardingStatus;
use paperclip::actix::{self, api_v2_operation, web};
use webhooks::events::WebhookEvent;
use webhooks::WebhookApp;
use webhooks::WebhookClient;

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Mark the onboarding as authorized and initiate IDV checks"
)]
#[actix::post("/hosted/onboarding/authorize")]
pub async fn post(user_auth: UserObAuthContext, state: web::Data<State>) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    // Verify there are no unmet requirements
    let (reqs, user_auth) = get_requirements(&state, user_auth).await?;
    let reqs = reqs
        .into_iter()
        // An Authorize requirement shouldn't block the authorize endpoint!
        .filter(|r| !matches!(r, OnboardingRequirement::Authorize { .. }))
        .collect_vec();
    if !reqs.is_empty() {
        let unmet_requirements = reqs.into_iter().map(|x| x.into()).collect_vec();
        return Err(OnboardingError::UnmetRequirements(unmet_requirements.into()).into());
    }

    // Mark the obs for the person and business as authorized
    let ob_id = user_auth.onboarding()?.id.clone();
    let (biz_ob, user_auth) = state
        .db_pool
        .db_transaction(move |c| -> ApiResult<_> {
            let ob = Onboarding::lock(c, &ob_id)?;
            if ob.authorized_at.is_none() {
                ob.into_inner().update(c, OnboardingUpdate::is_authorized())?;
            }
            let biz_ob = user_auth.business_onboarding(c)?;
            let bizob = biz_ob
                .map(|b| {
                    if b.authorized_at.is_none() {
                        b.update(c, OnboardingUpdate::is_authorized())
                    } else {
                        Ok(b)
                    }
                })
                .transpose()?;

            Ok((bizob, user_auth))
        })
        .await?;

    let span = tracing::Span::current();
    span.record("tenant_id", &format!("{:?}", user_auth.tenant()?.id.as_str()));
    span.record("tenant_name", &format!("{:?}", user_auth.tenant()?.id.as_str()));
    span.record("onboarding_id", &format!("{}", user_auth.onboarding()?.id));
    span.record("scoped_use_id", &format!("{}", user_auth.scoped_user.id));
    span.record(
        "ob_configuration_id",
        &format!("{}", user_auth.onboarding()?.ob_configuration_id),
    );
    let tenant_vendor_control = TenantVendorControl::new(
        user_auth.tenant()?.id.clone(),
        &state.db_pool,
        &state.enclave_client,
        &state.config,
    )
    .await?;
    // We shouldn't ever actually hit onboarding/authorize if the tenant has already onboarded this user,
    // but if we do, we should no-op and succeed
    let should_run_kyc_checks = user_auth.onboarding()?.idv_reqs_initiated_at.is_none();

    // Run KYC checks
    let ob_id = user_auth.onboarding()?.id.clone();
    if should_run_kyc_checks {
        let engine_result = run_kyc(&state, &user_auth, biz_ob.clone(), tenant_vendor_control).await;
        // We always want to return a validation to the client if the DE fails.
        // Since by this point we've notated authorize, saved VReqs and moved Onboarding to Pending status
        match engine_result {
            Ok(_) => (),
            Err(e) => {
                tracing::error!(error=%e, "Error running decision engine")
            }
        }
    }

    let sv_biz_id = biz_ob.as_ref().map(|biz| biz.scoped_vault_id.clone());

    // Kickoff KYB
    let tenant = user_auth.tenant()?;
    if let Some(biz_ob) = biz_ob {
        let should_run_kyb = should_run_kyb(&state, &biz_ob, tenant).await?;
        tracing::info!(should_run_kyb, "should_run_kyb");
        if should_run_kyb {
            let kyb_res = decision::vendor::middesk::run_kyb(
                &state.db_pool,
                &state.enclave_client,
                &state.middesk_client,
                &state.feature_flag_client,
                biz_ob.id,
            )
            .await;
            if let Err(e) = kyb_res {
                tracing::error!(error=%e, "Error kicking off KYB")
            }
        }
    }

    let (status, su, decision_timestamp, manual_review, ob_config) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            // Return status as well
            let (ob, scoped_user, manual_review, _) = Onboarding::get(conn, &ob_id)?;
            let ob_config = ObConfiguration::get_by_onboarding_id(conn, &ob.id)?;

            let status: OnboardingStatus = ob.status;
            // we shouldn't have many cases that need to fall back to Utc::now
            let timestamp = ob.authorized_at.unwrap_or_else(Utc::now);

            Ok((status, scoped_user, timestamp, manual_review, ob_config))
        })
        .await??;

    // Don't send a webhook if we already sent an onboarding.completed webhook
    if should_run_kyc_checks {
        // create the webhook event to fire
        let wh_event = WebhookEvent::OnboardingCompleted(webhooks::events::OnboardingCompletedPayload {
            fp_id: su.fp_id.clone(),
            footprint_user_id: tenant.uses_legacy_serialization().then(|| su.fp_id.clone()),
            timestamp: decision_timestamp,
            status,
            requires_manual_review: manual_review.is_some(),
        });

        state.webhook_service_client.send_event_to_tenant_non_blocking(
            WebhookApp {
                id: su.tenant_id.clone(),
                is_live: su.is_live,
            },
            wh_event,
            None,
        );
    }

    // If this user is onboarding to the tenant for the first time, create tenant-scoped fingerprints
    if should_run_kyc_checks {
        let sv_user_id = su.id.clone();

        let (uvw, bvw) = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let uvw: TenantVw<Person> = VaultWrapper::build_for_tenant(conn, &sv_user_id)?;
                let bvw = sv_biz_id
                    .map(|id| VaultWrapper::<Business>::build_for_tenant(conn, &id))
                    .transpose()?;

                Ok((uvw, bvw))
            })
            .await??;

        uvw.create_authorized_fingerprints(state.clone(), ob_config.clone())
            .await?;
        if let Some(bvw) = bvw {
            bvw.create_authorized_fingerprints(state, ob_config).await?;
        }
    }

    ResponseData::ok(EmptyResponse {}).json()
}

async fn run_kyc(
    state: &State,
    ob_info: &UserObSession,
    biz_ob: Option<Onboarding>, // TODO: remove from run_kyc and setup fixtures in run_kyb instead
    tenant_vendor_control: TenantVendorControl,
) -> Result<(), ApiError> {
    let scoped_user_id = ob_info.scoped_user.id.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::build(conn, VwArgs::Tenant(&scoped_user_id)))
        .await??;
    let ff_client = &state.feature_flag_client;
    let fixture_decision =
        decision::utils::get_fixture_data_decision(state, ff_client, &uvw, &ob_info.scoped_user.tenant_id)
            .await?;

    if let Some(fixture_decision) = fixture_decision {
        // Don't run prod IDV requests and instead just create fixture data for this user
        // TODO create more business fixture data
        let ob_id = ob_info.onboarding()?.id.clone();
        decision::utils::setup_test_fixtures(state, ob_id, biz_ob, fixture_decision).await?;
    } else {
        // Run KYC + produce a decision
        // Save Verification Requests, set ob to authorized, and (TODO) set onboarding to pending
        let ob = ob_info.onboarding()?.clone();
        let scoped_user_id = ob_info.scoped_user.id.clone();
        let tenant_vendor_control2 = tenant_vendor_control.clone();

        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<()> {
                // Once we set idv_reqs_initiated_at below, this lock will make sure we can't save multiple sets of VerificationRequests
                // and multiple decisions for an onboarding in a race condition (suppose we call /submit twice by accident)
                let ob = Onboarding::lock(conn, &ob.id)?;

                if ob.idv_reqs_initiated_at.is_some() {
                    return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
                }

                let decision_intent = DecisionIntent::get_or_create_onboarding_kyc(conn, &scoped_user_id)?;
                decision::vendor::build_verification_requests_and_checkpoint(
                    conn,
                    &uvw,
                    &scoped_user_id,
                    &decision_intent.id,
                    &tenant_vendor_control2,
                )?;
                ob.into_inner()
                    .update(conn, OnboardingUpdate::idv_reqs_initiated())?;

                Ok(())
            })
            .await?;

        decision::engine::run(
            // TODO don't pass in ob because it could be stale
            ob_info.onboarding()?.clone(),
            &state.db_pool,
            &state.enclave_client,
            state.config.service_config.is_production(),
            &state.feature_flag_client,
            &state.footprint_vendor_http_client,
            &state.socure_production_client,
            &state.twilio_client.client,
            &state.footprint_vendor_http_client,
            tenant_vendor_control,
        )
        .await?;
    }

    Ok(())
}

#[tracing::instrument(skip(state))]
async fn should_run_kyb(state: &State, biz_ob: &Onboarding, tenant: &Tenant) -> ApiResult<bool> {
    let svid = biz_ob.scoped_vault_id.clone();
    let ob_config_id = biz_ob.ob_configuration_id.clone();

    let bvw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::<Business>::build_for_tenant(conn, &svid))
        .await??;

    let dbo = bvw
        .decrypt_business_owners(&state.db_pool, &state.enclave_client, Some(ob_config_id))
        .await?;

    let bo_kyc_is_complete = match dbo {
        DecryptedBusinessOwners::KYBStart {
            primary_bo: _,
            primary_bo_vault: _,
        } => {
            tracing::info!(?biz_ob, "[should_run_kyb] KYBStart");
            false
        }
        // For Single-KYC KYB, only need the primary BO to have completed KYC
        DecryptedBusinessOwners::SingleKYC {
            primary_bo: _,
            primary_bo_vault,
            primary_bo_data: _,
            secondary_bos: _,
        } => {
            tracing::info!(?biz_ob, primary_bo_ob=?primary_bo_vault.2, "[should_run_kyb] SingleKYC");
            primary_bo_vault.2.status.has_decision()
        }
        // For Multi-KYC KYB, we need the primary BO and all secondary BOs to have completed KYC
        DecryptedBusinessOwners::MultiKYC {
            primary_bo: _,
            primary_bo_vault,
            primary_bo_data: _,
            secondary_bos,
        } => {
            tracing::info!(?biz_ob, primary_bo_ob=?primary_bo_vault.2, ?secondary_bos, "[should_run_kyb] MultiKYC");
            let all_secondary_not_initiated = secondary_bos.iter().all(|bo| bo.2.is_none());
            if all_secondary_not_initiated {
                // If we are in authorize and all secondary BOs have no vault, we are in authorize
                // for the primary BO. So, send the links out to all secondary BOs
                let secondary_bos = secondary_bos.iter().map(|bo| bo.1.clone()).collect();
                send_secondary_bo_links(state, &bvw, tenant, secondary_bos).await?;
            }
            primary_bo_vault.2.status.has_decision()
                && secondary_bos
                    .into_iter()
                    .all(|b| b.2.map(|d| d.2.status.has_decision()).unwrap_or(false))
        }
    };

    Ok(bo_kyc_is_complete && biz_ob.idv_reqs_initiated_at.is_none())
}
