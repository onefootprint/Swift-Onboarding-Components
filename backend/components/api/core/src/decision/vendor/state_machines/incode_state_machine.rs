use super::states::*;
use crate::decision::vendor::state_machines::states::VerificationSession;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::errors::{ApiResult, AssertionError};
use crate::{ApiError, State};
use async_trait::async_trait;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::ob_configuration::ObConfiguration;
use db::models::vault::Vault;
use db::DbPool;
use enum_dispatch::enum_dispatch;
use idv::footprint_http_client::FootprintVendorHttpClient;
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{
    DecisionIntentId, DocVData, DocumentRequestId, IdentityDocumentId, IncodeConfigurationId,
    IncodeVerificationSessionKind, IncodeVerificationSessionState, ScopedVaultId, TenantId,
};

pub type IsReady = bool;

/// Various context fields needed by ever stage of the state machine
#[derive(Clone)]
pub struct IncodeContext {
    pub di_id: DecisionIntentId,
    pub sv_id: ScopedVaultId,
    pub id_doc_id: IdentityDocumentId,
    pub vault: Vault,
    pub docv_data: DocVData,
    pub doc_request_id: DocumentRequestId,
}

/// This trait represents a running a state transition for an Incode Verification session
#[async_trait]
#[enum_dispatch]
pub trait IncodeStateTransition {
    async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<(IncodeState, IsReady)>;

    // TODO maybe we want an interface like the workflow machines where we have an async function
    // that loads any context and then a synchronous function that performs any db operations and
    // returns the next state transition
    fn is_ready(&self, ctx: &IncodeContext) -> bool;
}

// These are concrete structs that implement `IncodeStateTransition`. By using `enum_dispatch`,
// we can recover the structs rather than working with trait objects (and we get some runtime perf increases)
#[enum_dispatch(IncodeStateTransition)]
pub enum IncodeState {
    AddConsent,
    AddFront,
    AddBack,
    ProcessId,
    FetchScores,
    FetchOCR,
    Complete,
}

impl IncodeState {
    pub fn name(&self) -> IncodeVerificationSessionState {
        match self {
            IncodeState::AddFront(_) => IncodeVerificationSessionState::AddFront,
            IncodeState::AddConsent(_) => IncodeVerificationSessionState::AddConsent,
            IncodeState::AddBack(_) => IncodeVerificationSessionState::AddBack,
            IncodeState::ProcessId(_) => IncodeVerificationSessionState::ProcessId,
            IncodeState::FetchScores(_) => IncodeVerificationSessionState::FetchScores,
            IncodeState::FetchOCR(_) => IncodeVerificationSessionState::FetchOCR,
            IncodeState::Complete(_) => IncodeVerificationSessionState::Complete,
        }
    }
}

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
    ) -> Result<Self, ApiError> {
        // get incode credentials from TVC
        let tenant_vendor_control =
            TenantVendorControl::new(tenant_id, &state.db_pool, &state.enclave_client, &state.config).await?;

        // Load our existing state
        let sv_id = ctx.sv_id.clone();
        let id_doc_id = ctx.id_doc_id.clone();
        let config_id = configuration_id.clone();
        let session = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let session = IncodeVerificationSession::get(conn, &sv_id)?;
                let session = if let Some(existing) = session {
                    existing
                } else {
                    // Create a brand new session
                    let obc = ObConfiguration::get_by_scoped_vault_id(conn, &sv_id)?;
                    let session_kind = if obc.must_collect_selfie() {
                        IncodeVerificationSessionKind::Selfie
                    } else {
                        IncodeVerificationSessionKind::IdDocument
                    };

                    // Initialize the incode state
                    IncodeVerificationSession::create(conn, sv_id, config_id, id_doc_id, session_kind)?
                };
                Ok(session)
            })
            .await?;

        // Run StartOnboarding immediately - it sets up some data that all other states need
        if matches!(session.state, IncodeVerificationSessionState::StartOnboarding) {
            let credentials = tenant_vendor_control.incode_credentials();
            StartOnboarding::run(state, &ctx, session, credentials, configuration_id).await?;
        }

        // Refetch the session since it may have changed if we ran the start
        let sv_id = ctx.sv_id.clone();
        let session = state
            .db_pool
            .db_query(move |conn| IncodeVerificationSession::get(conn, &sv_id))
            .await??
            .ok_or(AssertionError("missing session"))?;
        let v_session = {
            let token = session
                .incode_authentication_token
                .ok_or(AssertionError("missing token"))?;
            VerificationSession {
                id: session.id,
                credentials: IncodeCredentialsWithToken {
                    credentials: tenant_vendor_control.incode_credentials(),
                    authentication_token: token.into(),
                },
            }
        };

        // Recover the session session and pick up where we left off
        let initial_state = match session.state {
            IncodeVerificationSessionState::AddConsent => AddConsent {}.into(),
            IncodeVerificationSessionState::AddFront => AddFront {}.into(),
            IncodeVerificationSessionState::AddBack => AddBack {}.into(),
            IncodeVerificationSessionState::ProcessId => ProcessId {}.into(),
            IncodeVerificationSessionState::FetchScores => FetchScores {}.into(),
            IncodeVerificationSessionState::FetchOCR => FetchOCR {}.into(),
            IncodeVerificationSessionState::Complete => Complete {}.into(),
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
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<Self, IncodeMachineError> {
        let mut machine = self;
        loop {
            // First, check if the state is ready to run. It's possible we're in a state like
            // AddBack but haven't yet collected the back image
            if !machine.state.is_ready(&machine.ctx) {
                break;
            }

            let is_ready;
            (machine, is_ready) = machine.step(db_pool, footprint_http_client).await?;

            // Check if the last state specifically requested to abort. This may happen if we need
            // some user input to re-run the current step
            if !is_ready {
                break;
            }
        }

        Ok(machine)
    }

    // Allows us to materialize each step
    pub async fn step(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<(Self, IsReady), IncodeMachineError> {
        let Self { state, ctx, session } = self;
        let current_state = state.name();

        let (s, is_ready) = state
            .run(db_pool, footprint_http_client, &ctx, &session)
            .await
            .map_err(|e| IncodeMachineError {
                state_name: current_state,
                error: e,
            })?;

        let state = Self {
            state: s,
            ctx,
            session,
        };
        Ok((state, is_ready))
    }
}
