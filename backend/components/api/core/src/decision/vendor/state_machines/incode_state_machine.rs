use async_trait::async_trait;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::vault::Vault;
use db::DbPool;
use enum_dispatch::enum_dispatch;
use idv::footprint_http_client::FootprintVendorHttpClient;

use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{
    DecisionIntentId, DocVData, DocumentRequestId, IdentityDocumentId, IncodeConfigurationId,
    IncodeVerificationSessionState, ScopedVaultId, TenantId,
};

use crate::config::Config;
use crate::decision::vendor::state_machines::states::VerificationSession;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::enclave_client::EnclaveClient;
use crate::ApiError;

use super::states::*;

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
    ) -> Result<IncodeState, ApiError>;
}

// These are concrete structs that implement `IncodeStateTransition`. By using `enum_dispatch`,
// we can recover the structs rather than working with trait objects (and we get some runtime perf increases)
#[enum_dispatch(IncodeStateTransition)]
pub enum IncodeState {
    StartOnboarding,
    AddConsent,
    AddFront,
    AddBack,
    RetryUpload,
    ProcessId,
    FetchScores,
    FetchOCR,
    Complete,
}

impl IncodeState {
    pub fn name(&self) -> IncodeVerificationSessionState {
        match self {
            IncodeState::StartOnboarding(_) => IncodeVerificationSessionState::StartOnboarding,
            IncodeState::AddFront(_) => IncodeVerificationSessionState::AddFront,
            IncodeState::AddConsent(_) => IncodeVerificationSessionState::AddConsent,
            IncodeState::AddBack(_) => IncodeVerificationSessionState::AddBack,
            IncodeState::RetryUpload(_) => IncodeVerificationSessionState::RetryUpload,
            IncodeState::ProcessId(_) => IncodeVerificationSessionState::ProcessId,
            IncodeState::FetchScores(_) => IncodeVerificationSessionState::FetchScores,
            IncodeState::FetchOCR(_) => IncodeVerificationSessionState::FetchOCR,
            IncodeState::Complete(_) => IncodeVerificationSessionState::Complete,
        }
    }

    fn is_terminal_state(&self) -> bool {
        matches!(
            self.name(),
            IncodeVerificationSessionState::RetryUpload | IncodeVerificationSessionState::Complete
        )
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
}

impl IncodeStateMachine {
    #[allow(clippy::too_many_arguments)]
    pub async fn init(
        tenant_id: TenantId,
        db_pool: &DbPool,
        enclave_client: &EnclaveClient,
        config: &Config,
        configuration_id: IncodeConfigurationId,
        ctx: IncodeContext,
    ) -> Result<Self, ApiError> {
        // get incode credentials from TVC
        let tenant_vendor_control =
            TenantVendorControl::new(tenant_id, db_pool, enclave_client, config).await?;

        // Load our existing state
        let sv_id = ctx.sv_id.clone();
        let existing_verification_session = db_pool
            .db_query(move |conn| IncodeVerificationSession::get(conn, &sv_id))
            .await??;

        let initial_state: IncodeState = if let Some(existing) = existing_verification_session {
            match existing.state {
                IncodeVerificationSessionState::RetryUpload => {
                    let token = existing
                        .incode_authentication_token
                        .ok_or(ApiError::AssertionError("missing token".into()))?
                        .to_string()
                        .into();
                    let session = VerificationSession {
                        id: existing.id,
                        credentials: IncodeCredentialsWithToken {
                            credentials: tenant_vendor_control.incode_credentials(),
                            authentication_token: token,
                        },
                    };
                    RetryUpload::init(session).into()
                }
                _ => return Err(ApiError::AssertionError("wrong state".into())),
            }
        } else {
            StartOnboarding {
                incode_credentials: tenant_vendor_control.incode_credentials(),
                configuration_id,
            }
            .into()
        };

        Ok(Self {
            state: initial_state,
            ctx,
        })
    }

    pub async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<Self, IncodeMachineError> {
        let mut machine = self;
        loop {
            machine = machine.step(db_pool, footprint_http_client).await?;

            // Break if in `Complete` or `RetryUpload`
            if machine.state.is_terminal_state() {
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
    ) -> Result<Self, IncodeMachineError> {
        let Self { state, ctx } = self;
        let current_state = state.name();

        let result = { state.run(db_pool, footprint_http_client, &ctx).await };

        result
            .map(|s| Self { state: s, ctx })
            .map_err(|e| IncodeMachineError {
                state_name: current_state,
                error: e,
            })
    }
}
