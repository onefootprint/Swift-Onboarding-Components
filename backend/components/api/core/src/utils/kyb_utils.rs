use super::vault_wrapper::Business;
use super::vault_wrapper::TenantVw;
use crate::auth::session::onboarding::BoSession;
use crate::config::LinkKind;
use crate::decision::biz_risk::BoWithKycInfo;
use crate::decision::biz_risk::KybBoFeatures;
use crate::decision::state::Authorize;
use crate::decision::state::BoKycCompleted;
use crate::decision::state::DocCollected;
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowWrapper;
use crate::errors::business::BusinessError;
use crate::utils::email::BoInviteEmailInfo;
use crate::utils::session::AuthSession;
use crate::FpResult;
use crate::State;
use api_errors::BadRequest;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::sms_message::SmsMessage;
use newtypes::BusinessDataKind as BDK;
use newtypes::BusinessOwnerKind;
use newtypes::DataLifetimeSeqno;
use newtypes::KybState;
use newtypes::PhoneNumber;
use newtypes::PiiString;
use newtypes::SessionAuthToken;
use newtypes::WorkflowId;
use newtypes::WorkflowKind;
use newtypes::WorkflowState;
use std::collections::HashMap;
use std::pin::Pin;

pub async fn generate_secondary_bo_links<'a>(
    state: &'a State,
    su: Option<&'a ScopedVault>,
    biz_wf: &'a Workflow,
    bos: &'a [BoWithKycInfo],
) -> FpResult<Vec<(&'a BoWithKycInfo, SessionAuthToken)>> {
    let missing_kyc_secondary_bos = bos
        .iter()
        .filter(|bo| bo.requires_kyc)
        .filter(|bo| !bo.has_kyc_result())
        // Don't send link to self
        .filter(|bo| !su.zip(bo.user_vault_id.as_ref()).is_some_and(|(su, bo_uv_id)| &su.vault_id == bo_uv_id))
        .collect_vec();
    if missing_kyc_secondary_bos.is_empty() {
        return Ok(vec![]);
    }

    // If we created any BOs in the DB, create an auth session for each of the BOs - we will send
    // this token in a link to each BO
    // TODO what happens when the session expires?
    let duration = chrono::Duration::days(30);
    let sealing_key = state.session_sealing_key.clone();
    let sessions_to_make = missing_kyc_secondary_bos
        .iter()
        .map(|bo| {
            let session_data = BoSession {
                bo_id: bo.bo.id.clone(),
                ob_config_id: biz_wf.ob_configuration_id.clone(),
                biz_wf_id: biz_wf.id.clone(),
            };
            (bo.bo.link_id.clone(), session_data)
        })
        .collect_vec();
    let mut tokens: HashMap<_, _> = state
        .db_query(move |conn| {
            sessions_to_make
                .into_iter()
                .map(|(l, d)| AuthSession::create_sync(conn, &sealing_key, d, duration).map(|(t, _)| (l, t)))
                .collect()
        })
        .await?;

    let tokens = missing_kyc_secondary_bos
        .into_iter()
        .map(|bo| {
            (tokens.remove(&bo.bo.link_id))
                .map(|t| (bo, t))
                .ok_or(BusinessError::LinkedBoNotFound)
        })
        .collect::<Result<_, _>>()?;
    Ok(tokens)
}

/// Given a list of new secondary_bos, send each of them a link to fill out their own KYC form
#[tracing::instrument(skip_all)]
pub async fn send_missing_secondary_bo_links(
    state: &State,
    bvw: &TenantVw<Business>,
    bos: &[BoWithKycInfo],
    tokens: Vec<(&BoWithKycInfo, SessionAuthToken)>,
    tenant: &Tenant,
) -> FpResult<()> {
    // Generate a link for each business owner
    let primary_bo = bos
        .iter()
        .find(|bo| bo.bo.kind == BusinessOwnerKind::Primary)
        .ok_or(BusinessError::PrimaryBoNotFound)?;
    let primary_bo = primary_bo.bo.clone();

    let (first_name, last_name) = primary_bo.name().ok_or(BadRequest("No name"))?;
    let inviter = PiiString::new(format!("{} {}", first_name.leak(), last_name.leak()));
    let business_name = bvw
        .get_p_data(&BDK::Name.into())
        .ok_or(BusinessError::NoName)?
        .clone();
    let bo_sms_info = tokens
        .into_iter()
        .map(|(bo_data, token)| -> FpResult<_> {
            let url = (state.config.service_config).generate_link(LinkKind::VerifyBusinessOwner, &token);
            let sms_message = SmsMessage::BoSession {
                inviter: inviter.clone(),
                business_name: business_name.clone(),
                tenant_name: tenant.name.clone(),
                url: url.clone(),
            };
            let phone_number = bo_data.phone_number().ok_or(BadRequest("BO has no phone"))?;
            let phone_number = PhoneNumber::parse(phone_number.clone())?;
            let email = bo_data.email().ok_or(BadRequest("BO has no email"))?;
            let sms = (sms_message, phone_number);
            let email = BoInviteEmailInfo {
                to_email: email.clone(),
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

#[tracing::instrument(skip(state))]
pub async fn progress_business_workflow(
    state: &State,
    su: Option<&ScopedVault>,
    tenant: &Tenant,
    biz_wf_id: WorkflowId,
    seqno: DataLifetimeSeqno,
    is_secondary_bo: bool,
) -> FpResult<()> {
    let biz_wf = state
        .db_query(move |conn| Workflow::get(conn, &biz_wf_id))
        .await?;
    let action = match biz_wf.state {
        // First see if we have to run authorize
        WorkflowState::Kyb(KybState::DataCollection) => Some(WorkflowActions::Authorize(Authorize { seqno })),
        WorkflowState::Kyb(KybState::DocCollection) => Some(WorkflowActions::DocCollected(DocCollected)),
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

    // Trigger BoKycCompleted to the workflow if it needs

    if !matches!(biz_wf.kind, WorkflowKind::Kyb) {
        return Ok(());
    }

    // Refresh the workflow
    let biz_wf = state
        .db_query(move |conn| Workflow::get(conn, &biz_wf.id))
        .await?;

    // We are waiting for a business document to be uploaded
    if !matches!(biz_wf.state, WorkflowState::Kyb(KybState::AwaitingBoKyc)) {
        return Ok(());
    }
    let (kyb_features, bvw, biz_wf) = KybBoFeatures::build(state, &biz_wf.id).await?;
    // Check if we're still waiting for BOs OR for the business to finish uploading a required document
    // before sending out links
    let is_waiting_for_bo_kyc = !kyb_features.all_bos_have_kyc_results();
    tracing::info!(is_waiting_for_bo_kyc, "is_waiting_for_bo_kyc");
    if is_waiting_for_bo_kyc && !is_secondary_bo {
        let KybBoFeatures { bos } = kyb_features;
        let tokens = generate_secondary_bo_links(state, su, &biz_wf, &bos).await?;
        send_missing_secondary_bo_links(state, &bvw, &bos, tokens, tenant).await?;
    }
    if is_waiting_for_bo_kyc {
        return Ok(());
    }

    let ww = WorkflowWrapper::init(state, biz_wf, seqno).await?;
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
