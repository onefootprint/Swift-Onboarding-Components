use std::pin::Pin;

use crate::business::index::{decrypt_basic_business_info, BasicBusinessInfo};
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::State;
use api_core::auth::session::ob_config::BoSession;
use api_core::errors::business::BusinessError;
use api_core::utils::email::BoInviteEmailInfo;
use api_core::utils::session::AuthSession;
use api_core::utils::twilio::BoSessionSmsInfo;
use api_core::utils::vault_wrapper::{Business, DecryptedBusinessOwners, TenantVw, VaultWrapper};
use db::models::business_owner::BusinessOwner;
use db::models::onboarding::Onboarding;
use db::models::tenant::Tenant;
use futures::FutureExt;
use newtypes::{BusinessOwnerKind, PiiString};

/// Given a list of new secondary_bos, send each of them a link to fill out their own KYC form
pub async fn send_secondary_bo_links(
    state: &State,
    bvw: &TenantVw<Business>,
    tenant: &Tenant,
    secondary_bos: Vec<BusinessOwner>,
) -> ApiResult<()> {
    if secondary_bos.is_empty() {
        return Ok(());
    }

    let BasicBusinessInfo {
        business_name,
        primary_bo,
        secondary_bos: secondary_bos_from_vault,
    } = decrypt_basic_business_info(state, bvw).await?;

    // If we created any BOs in the DB, create an auth session for each of the BOs - we will send
    // this token in a link to each BO
    use chrono::Duration;
    let ob_config_id = bvw
        .onboarding
        .clone()
        .map(|ob| ob.1.id)
        .ok_or(UserError::NotAllowedWithoutTenant)?;

    // TODO what happens when the session expires? similar to email link
    let duration = Duration::days(30);
    let auth_token_futs = secondary_bos
        .into_iter()
        .filter(|bo| bo.kind == BusinessOwnerKind::Secondary)
        .map(|bo| {
            let session_data = BoSession {
                bo_id: bo.id,
                ob_config_id: ob_config_id.clone(),
            };
            (bo.link_id, session_data)
        })
        .map(|(l_id, d)| AuthSession::create(state, d.into(), duration).map(|t| t.map(|t| (l_id, t))));

    // TODO batch this
    let tokens = futures::future::try_join_all(auth_token_futs).await?;

    // Generate a link for each business
    let inviter = PiiString::new(format!(
        "{} {}",
        primary_bo.first_name.leak(),
        primary_bo.last_name.leak()
    ));
    let bo_sms_info = tokens
        .into_iter()
        .map(|(l_id, token)| -> ApiResult<_> {
            let bo_data = secondary_bos_from_vault
                .get(&l_id)
                .ok_or(BusinessError::BoNotFound)?;
            let url = state.config.service_config.generate_verify_link(token, "bo");
            let sms = BoSessionSmsInfo {
                destination: &bo_data.phone_number,
                inviter: &inviter,
                business_name: &business_name,
                org_name: &tenant.name,
                url: url.clone(),
            };
            let email = BoInviteEmailInfo {
                to_email: bo_data.email.to_piistring(),
                inviter: &inviter,
                business_name: &business_name,
                org_name: &tenant.name,
                logo_url: tenant.logo_url.clone(),
                url,
            };
            Ok((sms, email))
        })
        .collect::<ApiResult<Vec<_>>>()?;

    let futs = bo_sms_info.into_iter().flat_map(|(sms, email)| {
        let sms = state.twilio_client.send_bo_session(state, sms);
        let email = state.sendgrid_client.send_business_owner_invite(email);
        let v: Vec<Pin<Box<dyn futures::Future<Output = ApiResult<()>>>>> =
            vec![Box::pin(sms), Box::pin(email)];
        v
    });
    futures::future::join_all(futs)
        .await
        .into_iter()
        .collect::<ApiResult<_>>()?;

    Ok(())
}

#[tracing::instrument(skip(state))]
pub async fn should_run_kyb(state: &State, biz_ob: &Onboarding, tenant: &Tenant) -> ApiResult<bool> {
    let svid = biz_ob.scoped_vault_id.clone();

    let bvw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::<Business>::build_for_tenant(conn, &svid))
        .await??;

    let dbo = bvw
        .decrypt_business_owners(&state.db_pool, &state.enclave_client, &tenant.id)
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
