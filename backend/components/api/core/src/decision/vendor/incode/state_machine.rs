use super::state::{IncodeState, IncodeStateTransition, RunTransition};
use super::states::*;
use crate::decision::vendor::incode::states::VerificationSession;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::errors::{ApiResult, AssertionError};
use crate::{ApiError, State};
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::ob_configuration::ObConfiguration;
use db::models::vault::Vault;
use db::DbPool;
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

impl IncodeState {
    pub fn name(&self) -> IncodeVerificationSessionState {
        match self {
            Self::AddFront(_) => IncodeVerificationSessionState::AddFront,
            Self::AddBack(_) => IncodeVerificationSessionState::AddBack,
            Self::AddConsent(_) => IncodeVerificationSessionState::AddConsent,
            Self::AddSelfie(_) => IncodeVerificationSessionState::AddSelfie,
            Self::ProcessId(_) => IncodeVerificationSessionState::ProcessId,
            Self::FetchScores(_) => IncodeVerificationSessionState::FetchScores,
            Self::FetchOCR(_) => IncodeVerificationSessionState::FetchOCR,
            Self::Complete(_) => IncodeVerificationSessionState::Complete,
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
                kind: session.kind,
                credentials: IncodeCredentialsWithToken {
                    credentials: tenant_vendor_control.incode_credentials(),
                    authentication_token: token.into(),
                },
            }
        };

        // Recover the session session and pick up where we left off
        let initial_state = match session.state {
            IncodeVerificationSessionState::AddFront => AddFront::new(),
            IncodeVerificationSessionState::AddBack => AddBack::new(),
            IncodeVerificationSessionState::AddConsent => AddConsent::new(),
            IncodeVerificationSessionState::AddSelfie => AddSelfie::new(),
            IncodeVerificationSessionState::ProcessId => ProcessId::new(),
            IncodeVerificationSessionState::FetchScores => FetchScores::new(),
            IncodeVerificationSessionState::FetchOCR => FetchOCR::new(),
            IncodeVerificationSessionState::Complete => Complete::new(),
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
        http_client: &FootprintVendorHttpClient,
    ) -> Result<Self, IncodeMachineError> {
        let mut machine = self;
        loop {
            let Self { state, ctx, session } = machine;
            let state_name = state.name();
            let (state, ctx, session, is_ready) = state
                .step(db_pool, http_client, ctx, session)
                .await
                .map_err(|e| IncodeMachineError { state_name, error: e })?;
            machine = Self { state, ctx, session };

            if !is_ready {
                break;
            };
        }

        Ok(machine)
    }
}
