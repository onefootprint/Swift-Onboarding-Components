use super::vault_wrapper::BusinessOwnerInfo;
use crate::auth::session::onboarding::BoSession;
use crate::config::LinkKind;
use crate::decision::state::Authorize;
use crate::decision::state::BoKycCompleted;
use crate::decision::state::DocCollected;
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowWrapper;
use crate::errors::business::BusinessError;
use crate::errors::ValidationError;
use crate::utils::email::BoInviteEmailInfo;
use crate::utils::session::AuthSession;
use crate::utils::vault_wrapper::Business;
use crate::utils::vault_wrapper::TenantVw;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use db::models::ob_configuration::ObConfiguration;
use db::models::tenant::Tenant;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::sms_message::SmsMessage;
use newtypes::BusinessDataKind as BDK;
use newtypes::BusinessOwnerKind;
use newtypes::DataLifetimeSeqno;
use newtypes::KybState;
use newtypes::PiiString;
use newtypes::WorkflowState;
use std::pin::Pin;

/// Given a list of new secondary_bos, send each of them a link to fill out their own KYC form
#[tracing::instrument(skip_all)]
pub async fn send_missing_secondary_bo_links(
    state: &State,
    biz_wf: &Workflow,
    bvw: &TenantVw<Business>,
    tenant: &Tenant,
    dbos: &[BusinessOwnerInfo],
) -> FpResult<()> {
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
    // TODO what happens when the session expires?
    let duration = chrono::Duration::days(30);
    let sealing_key = state.session_sealing_key.clone();
    let sessions_to_make = missing_kyc_secondary_bos
        .iter()
        .flat_map(|bo| bo.linked_bo.as_ref())
        .map(|bo| {
            let session_data = BoSession {
                bo_id: bo.id.clone(),
                ob_config_id: biz_wf.ob_configuration_id.clone(),
                biz_wf_id: Some(biz_wf.id.clone()),
            };
            (bo.link_id.clone(), session_data)
        })
        .collect_vec();
    let tokens: Vec<_> = state
        .db_pool
        .db_query(move |conn| {
            sessions_to_make
                .into_iter()
                .map(|(l, d)| {
                    AuthSession::create_sync(conn, &sealing_key, d, duration).map(|(token, _)| (l, token))
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
        .map(|(l_id, token)| -> FpResult<_> {
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
        .collect::<FpResult<Vec<_>>>()?;

    let futs = bo_sms_info
        .into_iter()
        .flat_map(|((sms, sms_destination), email)| {
            let t_id = Some(&tenant.id);
            let v_id = Some(&bvw.vault.id);
            let sms = state
                .sms_client
                .send_message(state, sms, sms_destination, t_id, v_id);
            let email = state.sendgrid_client.send_business_owner_invite(state, email);
            let v: Vec<Pin<Box<dyn futures::Future<Output = FpResult<()>>>>> =
                vec![Box::pin(sms), Box::pin(email)];
            v
        });
    futures::future::join_all(futs)
        .await
        .into_iter()
        .collect::<FpResult<_>>()?;

    Ok(())
}

async fn is_waiting_for_bo_kyc(dbo: &[BusinessOwnerInfo], obc: &ObConfiguration) -> FpResult<bool> {
    if obc.verification_checks().skip_kyc() {
        // Safe to proceed, don't need to wait for any BOs
        return Ok(false);
    }

    // TODO: consolidate this with kyb state machine logic, we should check if there's a complete WF
    // for the obc_id https://linear.app/footprint/issue/BE-513/consolidate-logic-for-bo-is-done-with-kyc
    // Or TODO: consolidate this to read BusinessWorkflowLink in the future
    let all_bos_complete = dbo
        .iter()
        .filter(|bo| bo.linked_bo.is_some())
        .all(|bo| bo.scoped_user.as_ref().is_some_and(|su| su.status.is_terminal()));
    Ok(!all_bos_complete)
}

#[tracing::instrument(skip(state))]
pub async fn progress_business_workflow(
    state: &State,
    tenant: &Tenant,
    biz_wf: Workflow,
    seqno: DataLifetimeSeqno,
) -> FpResult<()> {
    let wf_id = biz_wf.id.clone();
    let action = match biz_wf.state {
        // First see if we have to run authorize
        WorkflowState::Kyb(KybState::DataCollection) => Some(WorkflowActions::Authorize(Authorize { seqno })),
        // Handle the case where a document is being uploaded
        WorkflowState::Document(newtypes::DocumentState::DataCollection) => {
            Some(WorkflowActions::DocCollected(DocCollected {}))
        }
        // Handle other Kyb states
        WorkflowState::Kyb(_) => None,
        // Handle unknown states.
        _ => {
            tracing::error!(?biz_wf.state, "Unexpected business workflow state");
            None
        }
    };

    if let Some(action) = action {
        let ww = WorkflowWrapper::init(state, biz_wf.clone(), seqno).await?;
        let _ = ww
            .run(state, action)
            .await
            .map_err(|err| tracing::error!(?err, ?biz_wf.kind, "Error running business workflow"));
    }

    // Refresh the wf since it may have changed above
    let (biz_wf, bvw, obc) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let biz_wf = Workflow::get(conn, &wf_id)?;
            let bvw = VaultWrapper::<Business>::build_for_tenant(conn, &biz_wf.scoped_vault_id)?;
            let (obc, _) = ObConfiguration::get(conn, &biz_wf.ob_configuration_id)?;
            Ok((biz_wf, bvw, obc))
        })
        .await?;

    let dbo = bvw.decrypt_business_owners(state).await?;

    let is_waiting_for_bo_kyc = is_waiting_for_bo_kyc(&dbo, &obc).await?;
    tracing::info!(is_waiting_for_bo_kyc, "is_waiting_for_bo_kyc");

    if is_waiting_for_bo_kyc {
        send_missing_secondary_bo_links(state, &biz_wf, &bvw, tenant, &dbo).await?;
        return Ok(());
    }

    let ww = WorkflowWrapper::init(state, biz_wf.clone(), seqno).await?;
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
    Ok(())
}
