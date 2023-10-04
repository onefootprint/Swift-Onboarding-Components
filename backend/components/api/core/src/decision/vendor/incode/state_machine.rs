use std::sync::Arc;

use super::state::{IncodeState, IncodeStateTransition, RunTransition, StepResult};
use super::{get_config_id, states::*};
use crate::decision::vendor::build_request::build_docv_data_from_identity_doc;
use crate::decision::vendor::incode::states::VerificationSession;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::enclave_client::EnclaveClient;
use crate::errors::user::UserError;
use crate::errors::{ApiResult, AssertionError};
use crate::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use crate::vendor_clients::IncodeClients;
use crate::{ApiError, State};
use db::models::decision_intent::DecisionIntent;
use db::models::identity_document::IdentityDocument;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::ob_configuration::ObConfiguration;
use db::models::vault::Vault;
use db::DbPool;
use feature_flag::FeatureFlagClient;
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{
    DecisionIntentId, DecisionIntentKind, DocVData, DocumentRequestId, IdentityDocumentId,
    IncodeConfigurationId, IncodeFailureReason, IncodeVerificationSessionKind,
    IncodeVerificationSessionState, ScopedVaultId, TenantId, WorkflowId,
};

pub type IsReady = bool;

/// Various context fields needed by ever stage of the state machine
#[derive(Clone)]
pub struct IncodeContext {
    pub di_id: DecisionIntentId,
    pub sv_id: ScopedVaultId,
    pub id_doc_id: IdentityDocumentId,
    pub wf_id: WorkflowId,
    pub vault: Vault,
    pub docv_data: DocVData,
    pub doc_request_id: DocumentRequestId,
    pub enclave_client: EnclaveClient,
    pub tenant_id: TenantId,
    pub ff_client: Arc<dyn FeatureFlagClient>,
    pub failed_attempts_for_side: i64,
    pub disable_selfie: bool,
}

impl IncodeState {
    pub fn name(&self) -> IncodeVerificationSessionState {
        match self {
            Self::AddFront(_) => IncodeVerificationSessionState::AddFront,
            Self::AddBack(_) => IncodeVerificationSessionState::AddBack,
            Self::AddConsent(_) => IncodeVerificationSessionState::AddConsent,
            Self::AddSelfie(_) => IncodeVerificationSessionState::AddSelfie,
            Self::ProcessId(_) => IncodeVerificationSessionState::ProcessId,
            Self::ProcessFace(_) => IncodeVerificationSessionState::ProcessFace,
            Self::FetchScores(_) => IncodeVerificationSessionState::FetchScores,
            IncodeState::GetOnboardingStatus(_) => IncodeVerificationSessionState::GetOnboardingStatus,
            Self::Complete(_) => IncodeVerificationSessionState::Complete,
            Self::Fail(_) => IncodeVerificationSessionState::Fail,
        }
    }
}

/// Special error struct that shows in which state a given error occured while we are running
/// through multiple states
pub struct IncodeMachineError {
    pub error: ApiError,
    pub state_name: IncodeVerificationSessionState,
}

impl std::fmt::Debug for IncodeMachineError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        format!(
            "IncodeStateMachine error: state={:?} error={:?}",
            &self.state_name, &self.error
        )
        .fmt(f)
    }
}

/// The machine that initializes and then runs a series of state transitions
pub struct IncodeStateMachine {
    pub state: IncodeState,
    pub ctx: IncodeContext,
    pub session: VerificationSession,
}

impl IncodeStateMachine {
    pub async fn init(
        state: &State,
        tenant_id: TenantId,
        configuration_id: IncodeConfigurationId,
        ctx: IncodeContext,
        is_sandbox: bool,
    ) -> ApiResult<Self> {
        // get incode credentials from TVC
        let tenant_vendor_control =
            TenantVendorControl::new(tenant_id, &state.db_pool, &state.config, &state.enclave_client).await?;

        // Load our existing state
        let config_id = configuration_id.clone();
        let id_doc_id = ctx.id_doc_id.clone();
        let session = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let session = IncodeVerificationSession::get(conn, &id_doc_id)?;
                let session = if let Some(existing) = session {
                    existing
                } else {
                    // Create a brand new session
                    let (id_doc, doc_request) = IdentityDocument::get(conn, &id_doc_id)?;
                    let session_kind = if doc_request.should_collect_selfie && !id_doc.should_skip_selfie() {
                        IncodeVerificationSessionKind::Selfie
                    } else {
                        IncodeVerificationSessionKind::IdDocument
                    };

                    // Initialize the incode state
                    IncodeVerificationSession::create(conn, id_doc_id, config_id, session_kind)?
                };
                Ok(session)
            })
            .await?;

        // Run StartOnboarding immediately - it sets up some data that all other states need
        if matches!(session.state, IncodeVerificationSessionState::StartOnboarding) {
            let credentials = tenant_vendor_control.incode_credentials(is_sandbox);

            if is_sandbox {
                tracing::info!(tenant_name=%tenant_vendor_control.tenant_identifier(), sv_id=%ctx.sv_id.clone(), "sandbox incode request");
            }
            StartOnboarding::run(state, &ctx, session, credentials, configuration_id).await?;
        }

        // Refetch the session since it may have changed if we ran the start
        let id_doc_id = ctx.id_doc_id.clone();
        let session = state
            .db_pool
            .db_query(move |conn| IncodeVerificationSession::get(conn, &id_doc_id))
            .await??
            .ok_or(AssertionError("missing session"))?;
        let v_session = {
            let token = session
                .incode_authentication_token
                .ok_or(AssertionError("missing token"))?;
            VerificationSession {
                id: session.id,
                kind: session.kind,
                credentials: IncodeCredentialsWithToken {
                    credentials: tenant_vendor_control.incode_credentials(is_sandbox),
                    authentication_token: token.into(),
                },
                ignored_failure_reasons: session.ignored_failure_reasons,
                // TODO: be more intelligent about using incode classified doc type here.. but do we trust it?
                document_type: ctx.docv_data.document_type.ok_or(UserError::NoDocumentType)?,
            }
        };

        // Recover the session session and pick up where we left off
        let initial_state = match session.state {
            IncodeVerificationSessionState::AddFront => AddFront::new(),
            IncodeVerificationSessionState::AddBack => AddBack::new(),
            IncodeVerificationSessionState::AddConsent => AddConsent::new(),
            IncodeVerificationSessionState::AddSelfie => AddSelfie::new(),
            IncodeVerificationSessionState::ProcessId => ProcessId::new(),
            IncodeVerificationSessionState::ProcessFace => ProcessFace::new(),
            IncodeVerificationSessionState::FetchScores => FetchScores::new(),
            IncodeVerificationSessionState::GetOnboardingStatus => GetOnboardingStatus::new(),
            IncodeVerificationSessionState::Complete => Complete::new(),
            IncodeVerificationSessionState::Fail => Fail::new(),
            IncodeVerificationSessionState::StartOnboarding => {
                return Err(AssertionError("Should have already run StartOnboarding").into())
            }
        };

        Ok(Self {
            state: initial_state,
            ctx,
            session: v_session,
        })
    }

    pub async fn run(
        self,
        db_pool: &DbPool,
        clients: &IncodeClients,
    ) -> Result<(Self, Vec<IncodeFailureReason>), IncodeMachineError> {
        let mut machine = self;
        let failure_reasons = loop {
            let Self { state, ctx, session } = machine;
            let state_name = state.name();
            let (state, result, ctx, session) = state
                .step(db_pool, clients, ctx, session)
                .await
                .map_err(|e| IncodeMachineError { state_name, error: e })?;
            machine = Self { state, ctx, session };
            match result {
                StepResult::Ready => {}
                StepResult::Break => break vec![],
                StepResult::Retry(reasons) => break reasons,
            }
        };

        Ok((machine, failure_reasons))
    }

    // TODO:: use this from /upload as well?
    #[tracing::instrument(skip_all)]
    pub async fn init_from_existing(state: &State, ivs: IncodeVerificationSession) -> ApiResult<Self> {
        let idi = ivs.identity_document_id.clone();
        let (di, id_doc, doc_req, obc, uvw) = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let (id_doc, doc_req) = IdentityDocument::get(conn, &idi)?;

                let di = DecisionIntent::get_or_create_for_workflow(
                    conn,
                    &doc_req.scoped_vault_id,
                    &doc_req.workflow_id,
                    DecisionIntentKind::DocScan,
                )?;

                let uvw: VaultWrapper<Person> =
                    VaultWrapper::build(conn, VwArgs::Tenant(&doc_req.scoped_vault_id))?;
                let (obc, _) = ObConfiguration::get(conn, &doc_req.workflow_id)?;

                Ok((di, id_doc, doc_req, obc, uvw))
            })
            .await?;

        let docv_data = build_docv_data_from_identity_doc(state, id_doc.id.clone()).await?;
        let disable_selfie = state
            .feature_flag_client
            .flag(feature_flag::BoolFlag::DisableSelfieChecking(&obc.tenant_id));

        let ctx = IncodeContext {
            di_id: di.id.clone(),
            sv_id: doc_req.scoped_vault_id.clone(),
            id_doc_id: id_doc.id.clone(),
            wf_id: doc_req.workflow_id.clone(),
            vault: uvw.vault,
            docv_data,
            doc_request_id: doc_req.id,
            enclave_client: state.enclave_client.clone(),
            tenant_id: obc.tenant_id.clone(),
            ff_client: state.feature_flag_client.clone(),
            failed_attempts_for_side: 0, // !! this is the one thing that is hard coded here that would differ from the existing code path that inits a IVS. We could have this method pass in DocumentSide and calculate this for real and then also call this init method from /upload and consolidate code paths
            disable_selfie,
        };
        let is_sandbox = id_doc.fixture_result.is_some();
        let should_collect_selfie = doc_req.should_collect_selfie && !id_doc.should_skip_selfie();
        Self::init(
            state,
            obc.tenant_id,
            get_config_id(&state.config, should_collect_selfie, is_sandbox),
            ctx,
            is_sandbox,
        )
        .await
    }
}
