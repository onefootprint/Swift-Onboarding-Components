use crate::decision::document::route_handler::IncodeConfigurationIdOverride;
use crate::decision::vendor::build_request::build_docv_data_from_identity_doc;
use crate::decision::vendor::incode::get_config_id;
use crate::decision::vendor::incode::IncodeContext;
use crate::decision::vendor::incode::IncodeStateMachine;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpError;
use crate::State;
use api_errors::FpErrorCode;
use api_errors::FpResult;
use api_errors::ServerErr;
use api_errors::ServerErrInto;
use api_wire_types::DocumentImageError;
use api_wire_types::DocumentResponse;
use db::models::document::Document;
use db::models::document::DocumentUpdate;
use db::models::document_request::DocumentRequest;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::incode_verification_session::UpdateIncodeVerificationSession;
use db::models::ob_configuration::ObConfiguration;
use db::DbPool;
use feature_flag::FeatureFlagClient;
use newtypes::DecisionIntentId;
use newtypes::DocumentId;
use newtypes::DocumentSide;
use newtypes::DocumentStatus;
use newtypes::IncodeFailureReason;
use newtypes::IncodeVerificationSessionState;
use newtypes::TenantId;
use newtypes::WorkflowId;
use std::sync::Arc;
use tokio::time::Instant;

#[tracing::instrument(skip_all)]
#[allow(clippy::too_many_arguments)]
pub async fn handle_incode_request(
    state: &State,
    identity_document_id: DocumentId,
    tenant_id: TenantId,
    obc: ObConfiguration,
    decision_intent_id: DecisionIntentId,
    uvw: &VaultWrapper<Person>,
    doc_request: DocumentRequest,
    is_sandbox: bool,
    should_collect_selfie: bool,
    workflow_id: &WorkflowId,
    ff_client: Arc<dyn FeatureFlagClient>,
    failed_attempts_for_side: Option<i64>,
    is_re_run: bool,
    missing_sides: Vec<DocumentSide>, //kinda dumb
    configuration_id_override: IncodeConfigurationIdOverride,
    deadline: Instant,
) -> FpResult<DocumentResponse> {
    let docv_data = build_docv_data_from_identity_doc(state, identity_document_id.clone()).await?; // TODO: handle this with better requirement checking
    let vault_country = uvw.get_decrypted_country(state).await?;
    let sv_id: newtypes::ScopedVaultId = doc_request.scoped_vault_id.clone();
    let id_doc_id = identity_document_id.clone();
    let disable_selfie = state
        .ff_client
        .flag(feature_flag::BoolFlag::DisableSelfieChecking(&tenant_id));

    // Initialize our state machine
    let ctx = IncodeContext {
        di_id: decision_intent_id.clone(),
        sv_id: sv_id.clone(),
        id_doc_id,
        wf_id: workflow_id.clone(),
        obc: obc.clone(),
        vault: uvw.vault.clone(),
        docv_data,
        vault_country,
        doc_request_id: doc_request.id,
        state: state.clone(),
        tenant_id: tenant_id.clone(),
        ff_client,
        failed_attempts_for_side: failed_attempts_for_side.unwrap_or(0),
        disable_selfie,
        is_re_run,
        aws_selfie_client: state.aws_selfie_doc_client.clone(),
    };


    let machine_response_fut = init_and_run_incode_state_machine(
        state,
        ctx,
        identity_document_id.clone(),
        tenant_id,
        should_collect_selfie,
        is_sandbox,
        configuration_id_override,
        is_re_run,
    );

    let machine_response_fut_with_timeout = tokio::time::timeout_at(deadline, machine_response_fut);


    let machine_response = match machine_response_fut_with_timeout.await {
        Ok(result_without_timeout) => result_without_timeout?,
        Err(_) => {
            on_incode_hard_error(
                &state.db_pool,
                ServerErr("timeout running Incode machine"),
                &identity_document_id,
            )
            .await?;
            None
        }
    };

    if let Some((machine_state_name, retry_reasons)) = machine_response {
        let next_side_to_collect = match machine_state_name {
            IncodeVerificationSessionState::AddFront => Some(DocumentSide::Front),
            IncodeVerificationSessionState::AddBack => Some(DocumentSide::Back),
            IncodeVerificationSessionState::AddConsent => Some(DocumentSide::Selfie),
            IncodeVerificationSessionState::AddSelfie => Some(DocumentSide::Selfie),
            IncodeVerificationSessionState::Fail => None,
            IncodeVerificationSessionState::Complete => None,
            IncodeVerificationSessionState::GetOnboardingStatus => None, /* this would indicate we timed
                                                                           * out while polling Incode */
            // We shouldn't cleanly break from the machine in any other state
            s => {
                return ServerErrInto!("Can't determine next document side from {}", s);
            }
        };
        let is_retry_limit_exceeded = machine_state_name == IncodeVerificationSessionState::Fail;
        let errors = retry_reasons.into_iter().map(DocumentImageError::from).collect();
        Ok(DocumentResponse {
            next_side_to_collect,
            errors,
            is_retry_limit_exceeded,
        })
    } else {
        let next_side_to_collect = vec![DocumentSide::Front, DocumentSide::Back, DocumentSide::Selfie]
            .into_iter()
            .find(|s| missing_sides.contains(s));
        if next_side_to_collect.is_none() {
            let id_doc_id = identity_document_id.clone();
            state
                .db_transaction(move |conn| {
                    // mb lock??
                    let (iddoc, _) = Document::get(conn, &id_doc_id)?;
                    if iddoc.status == DocumentStatus::Pending {
                        Document::update(
                            conn,
                            &id_doc_id,
                            DocumentUpdate {
                                status: Some(DocumentStatus::Complete),
                                ..Default::default()
                            },
                        )?;
                    }
                    Ok(())
                })
                .await?;
        }
        Ok(DocumentResponse {
            next_side_to_collect,
            errors: vec![],
            is_retry_limit_exceeded: false,
        })
    }
}

#[allow(clippy::too_many_arguments)]
async fn init_and_run_incode_state_machine(
    state: &State,
    ctx: IncodeContext,
    identity_document_id: DocumentId,
    tenant_id: TenantId,
    should_collect_selfie: bool,
    is_sandbox: bool,
    configuration_id_override: IncodeConfigurationIdOverride,
    is_re_run: bool,
) -> FpResult<Option<(IncodeVerificationSessionState, Vec<IncodeFailureReason>)>> {
    let machine = IncodeStateMachine::init(
        state,
        tenant_id.clone(),
        // TODO: upstream this somewhere based on OBC
        get_config_id(
            state,
            should_collect_selfie,
            is_sandbox,
            &tenant_id,
            configuration_id_override.0,
        ),
        ctx,
        is_sandbox,
    )
    .await;

    let machine_response = match machine {
        Err(err) => {
            on_incode_hard_error(&state.db_pool, err, &identity_document_id).await?;
            None
        }
        Ok(machine) => {
            if machine.session.hard_errored && !is_re_run {
                None
            } else {
                match machine.run(&state.db_pool, &state.vendor_clients.incode).await {
                    Ok((machine, retry_reasons)) => Some((machine.state.name(), retry_reasons)),
                    Err(err) => {
                        on_incode_hard_error(&state.db_pool, err.error, &identity_document_id).await?;
                        None
                    }
                }
            }
        }
    };

    Ok(machine_response)
}

#[tracing::instrument(skip(db_pool))]
async fn on_incode_hard_error(db_pool: &DbPool, err: FpError, id_doc_id: &DocumentId) -> FpResult<()> {
    tracing::error!(?err, "IncodeMachineError");
    let id_doc_id = id_doc_id.clone();
    if err.code() == Some(FpErrorCode::IncodeMachineConcurrentChange) {
        tracing::error!(?err, "Not setting hard error");
        return Ok(());
    }

    db_pool
        .db_transaction(move |conn| {
            let ivs = IncodeVerificationSession::get(conn, &id_doc_id)?;

            if let Some(ivs) = ivs {
                // non-ideal, but prob fine to double query for this rare case
                let locked_ivs = IncodeVerificationSession::lock(conn, &ivs.id)?;
                IncodeVerificationSession::update(
                    locked_ivs,
                    conn,
                    UpdateIncodeVerificationSession::set_hard_error(format!("{:?}", err)),
                )?;
            }
            Ok(())
        })
        .await?;
    Ok(())
}
