use std::{collections::HashMap, pin::Pin};

use crate::{
    auth::session::ob_config::BoSession,
    config::LinkKind,
    decision::state::{Authorize, BoKycCompleted, WorkflowActions, WorkflowWrapper},
    errors::{business::BusinessError, onboarding::OnboardingError, ApiResult},
    utils::{
        email::BoInviteEmailInfo,
        session::AuthSession,
        vault_wrapper::{Business, DecryptedBusinessOwners, TenantVw, VaultWrapper},
    },
    State,
};
use db::models::{
    business_owner::BusinessOwner, ob_configuration::ObConfiguration, tenant::Tenant, workflow::Workflow,
};
use futures::FutureExt;
use itertools::Itertools;
use newtypes::{
    email::Email, sms_message::SmsMessage, BoLinkId, BusinessDataKind as BDK, BusinessOwnerKind, KybState,
    KycedBusinessOwnerData, NtResult, OnboardingStatus, PhoneNumber, PiiString, WorkflowState,
};

pub struct BasicBusinessInfo {
    pub business_name: PiiString,
    /// Primary BO, missing phone and email
    pub primary_bo: KycedBusinessOwnerData,
    /// Secondary BOs, with phone and email required
    pub secondary_bos: HashMap<BoLinkId, KycedBusinessOwnerData<BoLinkId, Email, PhoneNumber>>,
}

pub async fn decrypt_basic_business_info(
    state: &State,
    bvw: &TenantVw<Business>,
) -> ApiResult<BasicBusinessInfo> {
    let bos: Vec<KycedBusinessOwnerData> = bvw
        .decrypt_unchecked_single(&state.enclave_client, BDK::KycedBeneficialOwners.into())
        .await?
        .ok_or(BusinessError::NoBos)?
        .deserialize()?;
    let business_name = bvw
        .get_p_data(&BDK::Name.into())
        .ok_or(BusinessError::NoName)?
        .clone();

    // TODO: could this differ from the actual primary BO's first name + last name?
    // I don't think so by the client, but maybe on the backend we should compare and enforce
    let primary_bo = bos.first().ok_or(BusinessError::NoBos)?.clone();
    let secondary_bos = bos
        .into_iter()
        .skip(1)
        .map(|bo| bo.validate_has_email_and_phone())
        .map_ok(|bo| (bo.link_id.clone(), bo))
        .collect::<NtResult<HashMap<_, _>>>()?;
    let info = BasicBusinessInfo {
        business_name,
        primary_bo,
        secondary_bos,
    };
    Ok(info)
}

/// Given a list of new secondary_bos, send each of them a link to fill out their own KYC form
pub async fn send_secondary_bo_links(
    state: &State,
    wf: &Workflow,
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
    let obc_id = wf
        .ob_configuration_id
        .as_ref()
        .ok_or(OnboardingError::NoObcForWorkflow)?;

    // TODO what happens when the session expires? similar to email link
    let duration = Duration::days(30);
    let auth_token_futs = secondary_bos
        .into_iter()
        .filter(|bo| bo.kind == BusinessOwnerKind::Secondary)
        .map(|bo| {
            let session_data = BoSession {
                bo_id: bo.id,
                ob_config_id: obc_id.clone(),
            };
            (bo.link_id, session_data)
        })
        .map(|(l_id, d)| AuthSession::create(state, d.into(), duration).map(|t| t.map(|t| (l_id, t))));

    // TODO batch this
    let tokens = futures::future::try_join_all(auth_token_futs).await?;

    // Generate a link for each business owner
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
            let url = state
                .config
                .service_config
                .generate_link(LinkKind::VerifyBusinessOwner, &token);
            let sms_message = SmsMessage::BoSession {
                inviter: inviter.clone(),
                business_name: business_name.clone(),
                tenant_name: tenant.name.clone(),
                url: url.clone(),
            };
            let sms_destination = bo_data.phone_number.clone();
            let sms = (sms_message, sms_destination);
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

    let futs = bo_sms_info
        .into_iter()
        .flat_map(|((sms_message, sms_destination), email)| {
            let sms = state.sms_client.send_message(state, sms_message, sms_destination);
            let email = state.sendgrid_client.send_business_owner_invite(state, email);
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
async fn should_run_kyb(state: &State, biz_wf: &Workflow, tenant: &Tenant) -> ApiResult<bool> {
    let svid = biz_wf.scoped_vault_id.clone();

    let obc_id = biz_wf
        .ob_configuration_id
        .clone()
        .ok_or(OnboardingError::NoObcForWorkflow)?;
    let (bvw, obc) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let bvw = VaultWrapper::<Business>::build_for_tenant(conn, &svid)?;
            let (obc, _) = ObConfiguration::get(conn, &obc_id)?;
            Ok((bvw, obc))
        })
        .await?;

    let dbo = bvw
        .decrypt_business_owners(&state.db_pool, &state.enclave_client, &tenant.id)
        .await?;

    let has_decision = |s: Option<OnboardingStatus>| match s {
        None => false,
        Some(s) => s.has_decision(),
    };

    let bo_kyc_is_complete = match dbo {
        DecryptedBusinessOwners::NoVaultedOrLinkedBos => {
            tracing::info!(?biz_wf, "[should_run_kyb] NoVaultedOrLinkedBos");
            // For cases where kyb is manually run via /kyb without BOs, we allow running KYB
            true
        }
        DecryptedBusinessOwners::NoVaultedBos {
            primary_bo: _,
            primary_bo_vault: _,
        } => {
            tracing::info!(?biz_wf, "[should_run_kyb] NoVaultedBos");
            // If the playbook is skipping KYC of BOs, we can consider KYC complete
            obc.skip_kyc
        }
        // For Single-KYC KYB, only need the primary BO to have completed KYC
        DecryptedBusinessOwners::SingleKyc {
            primary_bo: _,
            primary_bo_vault,
            primary_bo_data: _,
            secondary_bos: _,
        } => {
            tracing::info!(?biz_wf, primary_bo_sv=?primary_bo_vault.0.id, "[should_run_kyb] SingleKYC");
            has_decision(primary_bo_vault.0.status)
        }
        // For Multi-KYC KYB, we need the primary BO and all secondary BOs to have completed KYC
        DecryptedBusinessOwners::MultiKyc {
            primary_bo: _,
            primary_bo_vault,
            primary_bo_data: _,
            secondary_bos,
        } => {
            tracing::info!(?biz_wf, primary_bo_sv=?primary_bo_vault.0.id, ?secondary_bos, "[should_run_kyb] MultiKYC");
            let all_secondary_not_initiated = secondary_bos.iter().all(|bo| bo.2.is_none());
            if all_secondary_not_initiated {
                // If we are in authorize and all secondary BOs have no vault, we are in authorize
                // for the primary BO. So, send the links out to all secondary BOs
                let secondary_bos = secondary_bos.iter().map(|bo| bo.1.clone()).collect();
                send_secondary_bo_links(state, biz_wf, &bvw, tenant, secondary_bos).await?;
            }
            has_decision(primary_bo_vault.0.status)
                && secondary_bos
                    .into_iter()
                    .all(|b| b.2.map(|d| has_decision(d.0.status)).unwrap_or(false))
        }
    };

    Ok(bo_kyc_is_complete)
}

#[tracing::instrument(skip(state))]
pub async fn run_kyb(state: &State, tenant: &Tenant, biz_wf: Workflow) -> ApiResult<()> {
    let wf_id = biz_wf.id.clone();

    // First see if we have to run authorize
    if matches!(biz_wf.state, WorkflowState::Kyb(KybState::DataCollection)) {
        // Authorize is kind of a misnomer now - it doesn't actually mark the workflow as
        // authorized - it just does some processing that normally happens after authorize
        let ww = WorkflowWrapper::init(state, biz_wf.clone()).await?;
        let _ = ww
            .run(state, WorkflowActions::Authorize(Authorize {}))
            .await
            .map_err(|err| tracing::error!(?err, "Error running Authorize on KYB workflow"));
    }

    // Refresh the wf since it may have changed above
    let biz_wf = state
        .db_pool
        .db_query(move |conn| Workflow::get(conn, &wf_id))
        .await?;
    let should_run_kyb = should_run_kyb(state, &biz_wf, tenant).await?;
    tracing::info!(should_run_kyb, "should_run_kyb");
    if should_run_kyb {
        let ww = WorkflowWrapper::init(state, biz_wf.clone()).await?;
        let res = ww
            .run(state, WorkflowActions::BoKycCompleted(BoKycCompleted {}))
            .await;
        match res {
            Ok(ww) => {
                tracing::info!(new_state = ?newtypes::WorkflowState::from(&ww.state), "Ran KYB workflow BoKycCompleted");
            }
            Err(err) => {
                tracing::error!(?err, "Error running BoKycCompleted on KYB workflow");
            }
        };
    }
    Ok(())
}
