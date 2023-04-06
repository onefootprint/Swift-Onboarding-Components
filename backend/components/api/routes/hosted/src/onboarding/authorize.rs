use crate::auth::user::AuthedOnboardingInfo;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScopeDiscriminant;
use crate::decision;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::errors::ApiResult;
use crate::onboarding::get_requirements;
use crate::types::response::ResponseData;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::State;
use api_core::decision::vendor::tenant_vendor_control::TenantVendorControl;
use chrono::Utc;
use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingUpdate;
use db::models::tenant::Tenant;
use db::models::tenant_vendor::TenantVendorControl as DbTenantVendorControl;
use db::models::verification_request::VerificationRequest;
use itertools::Itertools;
use newtypes::OnboardingStatus;
use newtypes::SessionAuthToken;
use newtypes::VendorAPI;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};
use tracing::{field, instrument};
use webhooks::events::WebhookEvent;
use webhooks::WebhookApp;
use webhooks::WebhookClient;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct CommitResponse {
    /// Footprint validation token
    validation_token: SessionAuthToken,
}

#[instrument(
        fields(
            tenant_id=field::Empty,
            tenant_name=field::Empty,
            onboarding=field::Empty,
            ob_configuration_id=field::Empty,
        ),
        skip_all
)]
#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Finish onboarding the user. Processes the collected data and returns the validation token that can be exchanged for a permanent Footprint user token."
)]
#[actix::post("/hosted/onboarding/authorize")]
pub async fn post(
    user_auth: UserAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<CommitResponse>>, ApiError> {
    let session_key = state.session_sealing_key.clone();
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;

    let (ob_info, biz_ob, tenant, db_tenant_vendor_control) = state
        .db_pool
        .db_transaction(move |c| -> ApiResult<_> {
            let ob_info = user_auth.assert_onboarding(c)?;
            // Verify there are no unmet requirements
            let scoped_business_id = user_auth.scoped_business_id();
            let (requirements, _) = get_requirements(c, &ob_info, scoped_business_id)?;

            if !requirements.is_empty() {
                let unmet_requirements = requirements.into_iter().map(|x| x.into()).collect_vec();
                return Err(OnboardingError::UnmetRequirements(unmet_requirements.into()).into());
            }
            let biz_ob = user_auth.business_onboarding(c)?;
            let tenant = Tenant::get(c, &ob_info.scoped_user.id)?;

            // Mark as authorized
            let ob = Onboarding::lock(c, &ob_info.onboarding.id)?;

            if ob.authorized_at.is_none() {
                ob.into_inner().update(c, OnboardingUpdate::is_authorized())?;
            }
            let bizob = biz_ob
                .map(|b| b.update(c, OnboardingUpdate::is_authorized()))
                .transpose()?;
            let db_tenant_vendor_control = DbTenantVendorControl::get(c, tenant.id.clone())?;

            Ok((ob_info, bizob, tenant, db_tenant_vendor_control))
        })
        .await?;

    let span = tracing::Span::current();
    span.record("tenant_id", &format!("{:?}", tenant.id.as_str()));
    span.record("tenant_name", &format!("{:?}", tenant.id.as_str()));
    span.record("onboarding_id", &format!("{}", ob_info.onboarding.id));
    span.record("scoped_use_id", &format!("{}", ob_info.scoped_user.id));
    span.record(
        "ob_configuration_id",
        &format!("{}", ob_info.onboarding.ob_configuration_id),
    );

    // We shouldn't ever actually hit onboarding/authorize if the tenant has already onboarded this user,
    // but if we do, we should no-op and succeed
    let should_run_kyc_checks = ob_info.onboarding.idv_reqs_initiated_at.is_none();

    // Run KYC checks
    let ob_id = ob_info.onboarding.id.clone();
    if should_run_kyc_checks {
        let engine_result = run_kyc(&state, ob_info, biz_ob.clone(), tenant, db_tenant_vendor_control).await;
        // We always want to return a validation to the client if the DE fails.
        // Since by this point we've notated authorize, saved VReqs and moved Onboarding to Pending status
        match engine_result {
            Ok(_) => (),
            Err(e) => {
                tracing::error!(error=%e, "Error running decision engine")
            }
        }
    }

    // Kickoff KYB
    if let Some(biz_ob) = biz_ob {
        // TODO: also check ob_config here to ensure this is a single-KYC flow
        if biz_ob.idv_reqs_initiated_at.is_none() {
            let kyb_res = run_kyb(&state, biz_ob).await;
            if let Err(e) = kyb_res {
                tracing::error!(error=%e, "Error kicking off KYB")
            }
        }
    }

    let (validation_token, status, su, decision_timestamp, manual_review, ob_configuration_id) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            // Return status as well
            let (ob, scoped_user, manual_review, _) = Onboarding::get(conn, &ob_id)?;

            let status: OnboardingStatus = ob.status;
            // we shouldn't have many cases that need to fall back to Utc::now
            let timestamp = ob.authorized_at.unwrap_or_else(Utc::now);

            let validation_token = super::create_onboarding_validation_token(conn, &session_key, ob.id)?;
            Ok((
                validation_token,
                status,
                scoped_user,
                timestamp,
                manual_review,
                ob.ob_configuration_id,
            ))
        })
        .await??;

    // Don't send a webhook if we already sent an onboarding.completed webhook
    if should_run_kyc_checks {
        // create the webhook event to fire
        let wh_event = WebhookEvent::OnboardingCompleted(webhooks::events::OnboardingCompletedPayload {
            footprint_user_id: su.fp_id.clone(),
            timestamp: decision_timestamp,
            status,
            onboarding_configuration_id: ob_configuration_id,
            requires_manual_review: manual_review.is_some(),
        });

        state.webhook_service_client.send_event_to_tenant_non_blocking(
            WebhookApp {
                id: su.tenant_id,
                is_live: su.is_live,
            },
            wh_event,
            None,
        );
    }

    Ok(Json(ResponseData {
        data: CommitResponse { validation_token },
    }))
}

async fn run_kyc(
    state: &State,
    ob_info: AuthedOnboardingInfo,
    biz_ob: Option<Onboarding>, // TODO: remove from run_kyc and setup fixtures in run_kyb instead
    tenant: Tenant,
    db_tenant_vendor_control: Option<DbTenantVendorControl>,
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
        decision::utils::setup_test_fixtures(state, ob_info.onboarding.id.clone(), biz_ob, fixture_decision)
            .await?;
    } else {
        // Run KYC + produce a decision
        // Save Verification Requests, set ob to authorized, and (TODO) set onboarding to pending
        let ob = ob_info.onboarding.clone();
        let scoped_user_id = ob_info.scoped_user.id.clone();

        // Load vendor control
        let tenant_vendor_control = TenantVendorControl::new(
            &state.config,
            db_tenant_vendor_control,
            &state.enclave_client,
            &tenant.e_private_key,
        )
        .await
        .map_err(crate::decision::Error::from)?;

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
                )?;
                ob.into_inner()
                    .update(conn, OnboardingUpdate::idv_reqs_initiated())?;

                Ok(())
            })
            .await?;

        decision::engine::run(
            ob_info.onboarding,
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

async fn run_kyb(state: &State, biz_ob: Onboarding) -> Result<(), ApiError> {
    let obid = biz_ob.id.clone();
    let (vreq, ob_configuration_key) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ob = Onboarding::lock(conn, &biz_ob.id)?;

            if biz_ob.idv_reqs_initiated_at.is_some() {
                return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
            }

            let ob_configuration_key = ObConfiguration::get_by_onboarding_id(conn, &ob.id)?.key;

            let decision_intent = DecisionIntent::get_or_create_onboarding_kyb(conn, &ob.scoped_vault_id)?;
            let vreq = VerificationRequest::create(
                conn,
                &ob.scoped_vault_id,
                &decision_intent.id,
                VendorAPI::MiddeskCreateBusiness,
            )?;

            ob.into_inner()
                .update(conn, OnboardingUpdate::idv_reqs_initiated())?;

            Ok((vreq, ob_configuration_key))
        })
        .await?;

    decision::vendor::make_request::make_kyb_request(
        &state.db_pool,
        &state.enclave_client,
        vreq,
        &obid,
        &state.middesk_client,
        &state.feature_flag_client,
        ob_configuration_key,
    )
    .await?;

    Ok(())
}
