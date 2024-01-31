use crate::{
    decision::vendor::{
        build_request::build_docv_data_from_identity_doc,
        incode::{get_config_id, IncodeContext, IncodeStateMachine},
    },
    errors::{ApiError, ApiResult, AssertionError},
    utils::vault_wrapper::{Person, VaultWrapper},
    State,
};
use api_wire_types::{DocumentImageError, DocumentResponse};
use db::{
    models::{
        document_request::DocumentRequest,
        identity_document::{IdentityDocument, IdentityDocumentUpdate},
        incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession},
        ob_configuration::ObConfiguration,
    },
    DbPool,
};
use feature_flag::FeatureFlagClient;
use newtypes::{
    DecisionIntentId, DocumentSide, IdentityDocumentId, IdentityDocumentStatus,
    IncodeVerificationSessionState, TenantId, WorkflowId,
};
use std::sync::Arc;

#[tracing::instrument(skip_all)]
#[allow(clippy::too_many_arguments)]
pub async fn handle_incode_request(
    state: &State,
    identity_document_id: IdentityDocumentId,
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
) -> Result<DocumentResponse, ApiError> {
    let docv_data = build_docv_data_from_identity_doc(state, identity_document_id.clone()).await?; // TODO: handle this with better requirement checking
    let vault_country = uvw.get_decrypted_country(state).await?;
    let sv_id: newtypes::ScopedVaultId = doc_request.scoped_vault_id.clone();
    let id_doc_id = identity_document_id.clone();
    let disable_selfie = state
        .feature_flag_client
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
        enclave_client: state.enclave_client.clone(),
        tenant_id: tenant_id.clone(),
        ff_client,
        failed_attempts_for_side: failed_attempts_for_side.unwrap_or(0),
        disable_selfie,
        is_re_run,
        aws_selfie_client: state.aws_selfie_doc_client.clone(),
    };
    let machine = IncodeStateMachine::init(
        state,
        tenant_id.clone(),
        // TODO: upstream this somewhere based on OBC
        get_config_id(state, should_collect_selfie, is_sandbox, &tenant_id),
        ctx,
        is_sandbox,
    )
    .await;

    let successful_machine_response = match machine {
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

    if let Some((machine_state_name, retry_reasons)) = successful_machine_response {
        let next_side_to_collect = match machine_state_name {
            IncodeVerificationSessionState::AddFront => Some(DocumentSide::Front),
            IncodeVerificationSessionState::AddBack => Some(DocumentSide::Back),
            IncodeVerificationSessionState::AddConsent => Some(DocumentSide::Selfie),
            IncodeVerificationSessionState::AddSelfie => Some(DocumentSide::Selfie),
            IncodeVerificationSessionState::Fail => None,
            IncodeVerificationSessionState::Complete => None,
            IncodeVerificationSessionState::GetOnboardingStatus => None, // this would indicate we timed out while polling Incode
            // We shouldn't cleanly break from the machine in any other state
            s => {
                return Err(AssertionError(&format!("Can't determine next document side from {}", s)).into())
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
                .db_pool
                .db_transaction(move |conn| -> ApiResult<_> {
                    // mb lock??
                    let (iddoc, _) = IdentityDocument::get(conn, &id_doc_id)?;
                    if iddoc.status == IdentityDocumentStatus::Pending {
                        IdentityDocument::update(
                            conn,
                            &id_doc_id,
                            IdentityDocumentUpdate {
                                status: Some(IdentityDocumentStatus::Complete),
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

async fn on_incode_hard_error(
    db_pool: &DbPool,
    err: ApiError,
    id_doc_id: &IdentityDocumentId,
) -> ApiResult<()> {
    tracing::error!(?err, "IncodeMachineError");
    let id_doc_id = id_doc_id.clone();
    db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ivs = IncodeVerificationSession::get(conn, &id_doc_id)?;
            if let Some(ivs) = ivs {
                IncodeVerificationSession::update(
                    conn,
                    &ivs.id,
                    UpdateIncodeVerificationSession::set_hard_error(format!("{:?}", err)),
                )?;
            }
            Ok(())
        })
        .await?;
    Ok(())
}
