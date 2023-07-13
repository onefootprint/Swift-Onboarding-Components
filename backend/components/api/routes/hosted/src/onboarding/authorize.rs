use crate::auth::user::UserAuthGuard;
use crate::business::utils::send_secondary_bo_links;
use crate::decision;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiResult;
use crate::onboarding::get_requirements;
use crate::onboarding::GetRequirementsArgs;
use crate::types::response::ResponseData;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::user::UserObAuthContext;
use api_core::decision::state::common;
use api_core::task;
use api_core::types::EmptyResponse;
use api_core::types::JsonApiResponse;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::DecryptedBusinessOwners;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingUpdate;
use db::models::tenant::Tenant;
use itertools::Itertools;
use newtypes::OnboardingRequirement;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Mark the onboarding as authorized and initiate IDV checks"
)]
#[actix::post("/hosted/onboarding/authorize")]
pub async fn post(user_auth: UserObAuthContext, state: web::Data<State>) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    let span = tracing::Span::current();
    span.record("tenant_id", &format!("{:?}", user_auth.tenant()?.id.as_str()));
    span.record("tenant_name", &format!("{:?}", user_auth.tenant()?.id.as_str()));
    span.record("onboarding_id", &format!("{}", user_auth.onboarding()?.id));
    span.record("scoped_user_id", &format!("{}", user_auth.scoped_user.id));
    span.record(
        "ob_configuration_id",
        &format!("{}", user_auth.onboarding()?.ob_configuration_id),
    );
    span.record(
        "workflow_id",
        &format!(
            "{}",
            user_auth.workflow().map(|wf| wf.id.clone()).unwrap_or_default()
        ),
    );

    // Verify there are no unmet requirements
    let reqs = get_requirements(&state, GetRequirementsArgs::from(&user_auth)?).await?;
    let unmet_reqs = reqs
        .into_iter()
        .filter(|r| !r.is_met())
        // An Authorize/Process requirement shouldn't block the authorize endpoint!
        .filter(|r| !matches!(r, OnboardingRequirement::Authorize { .. } | OnboardingRequirement::Process))
        .collect_vec();
    if !unmet_reqs.is_empty() {
        let unmet_reqs = unmet_reqs.into_iter().map(|x| x.into()).collect_vec();
        return Err(OnboardingError::UnmetRequirements(unmet_reqs.into()).into());
    }

    // mark person and business ob as authorized
    let ob_id = user_auth.onboarding()?.id.clone();

    let (biz_ob, user_auth, set_biz_is_authorized) = state
        .db_pool
        .db_transaction(move |c| -> ApiResult<_> {
            let ob = Onboarding::lock(c, &ob_id)?;
            if ob.authorized_at.is_none() {
                Onboarding::update(ob, c, OnboardingUpdate::is_authorized())?;
                true
            } else {
                false
            };

            let biz_ob = user_auth.business_onboarding(c)?;
            let (set_biz_is_authorized, bizob) = if let Some(biz_ob) = biz_ob {
                let b = Onboarding::lock(c, &biz_ob.id)?;
                let (set_biz_is_authorized, bizob) = if b.authorized_at.is_none() {
                    (
                        true,
                        Onboarding::update(b, c, OnboardingUpdate::is_authorized_and_status_pending())?,
                    )
                } else {
                    (false, b.into_inner())
                };
                (set_biz_is_authorized, Some(bizob))
            } else {
                (false, biz_ob)
            };

            Ok((bizob, user_auth, set_biz_is_authorized))
        })
        .await?;

    let sv_biz_id = biz_ob.as_ref().map(|biz| biz.scoped_vault_id.clone());
    if let Some(sv_biz_id) = sv_biz_id {
        if set_biz_is_authorized {
            common::write_authorized_fingerprints(&state, &sv_biz_id).await?;
        }
    }

    // Run KYB
    let tenant = user_auth.tenant()?;
    if let Some(biz_ob) = biz_ob {
        let should_run_kyb = should_run_kyb(&state, &biz_ob, tenant).await?;
        tracing::info!(should_run_kyb, "should_run_kyb");
        if should_run_kyb {
            let uv = user_auth.user();
            let kyb_res = decision::vendor::middesk::run_kyb(&state, biz_ob.id, uv, &tenant.id).await;
            if let Err(e) = kyb_res {
                tracing::error!(error=%e, "Error kicking off KYB")
            }
        }
    }

    // temporary until we migrate to a KYB workflow
    task::execute_webhook_tasks((*state.clone().into_inner()).clone());
    ResponseData::ok(EmptyResponse {}).json()
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
