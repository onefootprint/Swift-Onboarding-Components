use super::vault_wrapper::BusinessOwnerInfo;
use crate::auth::session::ob_config::BoSession;
use crate::config::LinkKind;
use crate::decision::state::{
    Authorize,
    BoKycCompleted,
    WorkflowActions,
    WorkflowWrapper,
};
use crate::errors::business::BusinessError;
use crate::errors::onboarding::OnboardingError;
use crate::errors::{
    ApiResult,
    ValidationError,
};
use crate::utils::email::BoInviteEmailInfo;
use crate::utils::session::AuthSession;
use crate::utils::vault_wrapper::{
    Business,
    TenantVw,
    VaultWrapper,
};
use crate::State;
use actix_web::ResponseError;
use db::models::ob_configuration::ObConfiguration;
use db::models::tenant::Tenant;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::sms_message::SmsMessage;
use newtypes::{
    BusinessDataKind as BDK,
    BusinessOwnerKind,
    KybState,
    OnboardingStatus,
    PiiString,
    WorkflowState,
};
use std::pin::Pin;

/// Given a list of new secondary_bos, send each of them a link to fill out their own KYC form
#[tracing::instrument(skip_all)]
pub async fn send_missing_secondary_bo_links(
    state: &State,
    wf: &Workflow,
    bvw: &TenantVw<Business>,
    tenant: &Tenant,
    dbos: &[BusinessOwnerInfo],
) -> ApiResult<()> {
    let missing_kyc_secondary_bos = dbos
        .iter()
        .filter(|bo| bo.kind == BusinessOwnerKind::Secondary)
        .filter(|bo| bo.from_kyced_beneficial_owners)
        .filter(|bo| bo.scoped_user.is_none())
        .collect_vec();
    if missing_kyc_secondary_bos.is_empty() {
        return Ok(());
    }

    // If we created any BOs in the DB, create an auth session for each of the BOs - we will send
    // this token in a link to each BO
    let obc_id = wf
        .ob_configuration_id
        .as_ref()
        .ok_or(OnboardingError::NoObcForWorkflow)?;

    // TODO what happens when the session expires? similar to email link
    let duration = chrono::Duration::days(30);
    let sealing_key = state.session_sealing_key.clone();
    let sessions_to_make = missing_kyc_secondary_bos
        .iter()
        .flat_map(|bo| bo.linked_bo.as_ref())
        .map(|bo| {
            let session_data = BoSession {
                bo_id: bo.id.clone(),
                ob_config_id: obc_id.clone(),
            };
            (bo.link_id.clone(), session_data)
        })
        .collect_vec();
    let tokens = state
        .db_pool
        .db_query(move |conn| -> ApiResult<Vec<_>> {
            sessions_to_make
                .into_iter()
                .map(|(l_id, d)| -> ApiResult<_> {
                    let (token, _) = AuthSession::create_sync(conn, &sealing_key, d.into(), duration)?;
                    Ok((l_id, token))
                })
                .collect()
        })
        .await?;

    // Generate a link for each business owner
    let primary_bo = dbos
        .iter()
        .find(|bo| bo.kind == BusinessOwnerKind::Primary)
        .ok_or(BusinessError::PrimaryBoNotFound)?
        .clone();
    let first_name = primary_bo.first_name.ok_or(ValidationError("No first name"))?;
    let last_name = primary_bo.last_name.ok_or(ValidationError("No last name"))?;
    let inviter = PiiString::new(format!("{} {}", first_name.leak(), last_name.leak()));
    let business_name = bvw
        .get_p_data(&BDK::Name.into())
        .ok_or(BusinessError::NoName)?
        .clone();
    let bo_sms_info = tokens
        .into_iter()
        .map(|(l_id, token)| -> ApiResult<_> {
            let bo_data = missing_kyc_secondary_bos
                .iter()
                .find(|bo| bo.linked_bo.as_ref().is_some_and(|bo| bo.link_id == l_id))
                .ok_or(BusinessError::LinkedBoNotFound)?;
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

            let phone_number = bo_data
                .phone_number
                .as_ref()
                .ok_or(ValidationError("BO has no phone"))?;
            let email = bo_data.email.as_ref().ok_or(ValidationError("BO has no email"))?;
            let sms = (sms_message, phone_number.clone());
            let email = BoInviteEmailInfo {
                to_email: email.to_piistring(),
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

    let dbo = bvw.decrypt_business_owners(state, &tenant.id).await?;

    send_missing_secondary_bo_links(state, biz_wf, &bvw, tenant, &dbo).await?;

    let has_decision = |s: Option<&OnboardingStatus>| match s {
        None => false,
        Some(s) => s.has_decision(),
    };

    let all_bo_kyc_complete = dbo
        .iter()
        .filter(|bo| bo.linked_bo.is_some())
        .all(|bo| has_decision(bo.scoped_user.as_ref().and_then(|su| su.status.as_ref())));

    let should_run_kyb = obc.skip_kyc || all_bo_kyc_complete;
    Ok(should_run_kyb)
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
            Err(err) if !err.status_code().is_server_error() => {
                // We want to expose HTTP 4xx errors to the client since they could be fixed by the client
                tracing::error!(?err, "Non-server error running BoKycCompleted on KYB workflow");
                return Err(err);
            }
            Err(err) => {
                tracing::error!(?err, "Error running BoKycCompleted on KYB workflow");
            }
        };
    }
    Ok(())
}
