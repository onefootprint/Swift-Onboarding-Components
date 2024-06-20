use super::get_config_id;
use super::state::IncodeState;
use super::state::IncodeStateTransition;
use super::state::RunTransition;
use super::state::StepResult;
use super::states::*;
use crate::decision::vendor::build_request::build_docv_data_from_identity_doc;
use crate::decision::vendor::incode::states::VerificationSession;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::errors::AssertionError;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::vendor_clients::IncodeClients;
use crate::ApiError;
use crate::State;
use db::models::decision_intent::DecisionIntent;
use db::models::document::Document;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::ob_configuration::ObConfiguration;
use db::models::vault::Vault;
use db::DbPool;
use feature_flag::FeatureFlagClient;
use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::DecisionIntentId;
use newtypes::DecisionIntentKind;
use newtypes::DocVData;
use newtypes::DocumentId;
use newtypes::DocumentRequestId;
use newtypes::IncodeConfigurationId;
use newtypes::IncodeEnvironment;
use newtypes::IncodeFailureReason;
use newtypes::IncodeVerificationSessionKind;
use newtypes::IncodeVerificationSessionState;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::WorkflowId;
use selfie_doc::AwsSelfieDocClient;
use std::sync::Arc;

pub type IsReady = bool;

/// Various context fields needed by ever stage of the state machine
#[derive(Clone)]
pub struct IncodeContext {
    pub di_id: DecisionIntentId,
    pub sv_id: ScopedVaultId,
    pub id_doc_id: DocumentId,
    pub wf_id: WorkflowId,
    pub obc: ObConfiguration,
    pub vault: Vault,
    pub docv_data: DocVData,
    pub vault_country: Option<Iso3166TwoDigitCountryCode>,
    pub doc_request_id: DocumentRequestId,
    pub state: State,
    pub tenant_id: TenantId,
    pub ff_client: Arc<dyn FeatureFlagClient>,
    pub failed_attempts_for_side: i64,
    pub disable_selfie: bool,
    /// When true, the machine is running specifically inside the private, manual incode re-run
    /// endpoint
    pub is_re_run: bool,
    pub aws_selfie_client: AwsSelfieDocClient,
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
            Self::GetOnboardingStatus(_) => IncodeVerificationSessionState::GetOnboardingStatus,
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
        let use_demo_creds_in_livemode =
            state
                .ff_client
                .flag(feature_flag::BoolFlag::UseIncodeDemoCredentialsInLivemode(
                    &tenant_id,
                ));
        let default_environment = if is_sandbox || use_demo_creds_in_livemode {
            IncodeEnvironment::Demo
        } else {
            IncodeEnvironment::Production
        };

        // get incode credentials from TVC
        let tenant_vendor_control =
            TenantVendorControl::new(tenant_id, &state.db_pool, &state.config, &state.enclave_client).await?;

        // Load our existing state
        let config_id = configuration_id.clone();
        let id_doc_id = ctx.id_doc_id.clone();
        let session = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                // TODO: we need to handle auth tokens expiring on stale IVS sessions
                // (e.g. someone starts and then comes back > 90d we will error here.)
                let session = IncodeVerificationSession::get(conn, &id_doc_id)?;
                let session = if let Some(existing) = session {
                    existing
                } else {
                    // Create a brand new session
                    let (id_doc, doc_request) = Document::get(conn, &id_doc_id)?;
                    let session_kind = if doc_request.should_collect_selfie() && !id_doc.should_skip_selfie()
                    {
                        IncodeVerificationSessionKind::Selfie
                    } else {
                        IncodeVerificationSessionKind::IdDocument
                    };

                    // Initialize the incode state
                    IncodeVerificationSession::create(
                        conn,
                        id_doc_id,
                        config_id,
                        session_kind,
                        Some(default_environment),
                        None,
                    )?
                };
                Ok(session)
            })
            .await?;
        let credentials = tenant_vendor_control
            .incode_credentials(session.incode_environment.unwrap_or(default_environment));
        // Run StartOnboarding immediately - it sets up some data that all other states need
        if matches!(session.state, IncodeVerificationSessionState::StartOnboarding) {
            if is_sandbox {
                tracing::info!(tenant_name=%tenant_vendor_control.tenant_identifier(), sv_id=%ctx.sv_id.clone(), "sandbox incode request");
            }
            StartOnboarding::run(state, &ctx, session, credentials.clone(), configuration_id).await?;
        }

        // Refetch the session since it may have changed if we ran the start
        let id_doc_id = ctx.id_doc_id.clone();
        let session = state
            .db_pool
            .db_query(move |conn| IncodeVerificationSession::get(conn, &id_doc_id))
            .await?
            .ok_or(AssertionError("missing session"))?;
        let v_session = {
            let token = session
                .incode_authentication_token
                .ok_or(AssertionError("missing token"))?;
            VerificationSession {
                id: session.id,
                kind: session.kind,
                credentials: IncodeCredentialsWithToken {
                    credentials,
                    authentication_token: token.to_string().into(),
                },
                ignored_failure_reasons: session.ignored_failure_reasons,
                // TODO: be more intelligent about using incode classified doc type here.. but do we trust it?
                document_type: ctx.docv_data.document_type.ok_or(UserError::NoDocumentType)?,
                hard_errored: session.latest_hard_error.is_some(),
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

    // TODO:: use this from /upload as well? be careful on is_re_run param below if so
    #[tracing::instrument(skip_all)]
    pub async fn init_from_existing(state: &State, ivs: IncodeVerificationSession) -> ApiResult<Self> {
        let idi = ivs.identity_document_id.clone();
        let (di, id_doc, doc_req, obc, uvw) = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let (id_doc, doc_req) = Document::get(conn, &idi)?;

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
        let vault_country = uvw.get_decrypted_country(state).await?;
        let disable_selfie = state
            .ff_client
            .flag(feature_flag::BoolFlag::DisableSelfieChecking(&obc.tenant_id));

        let should_collect_selfie = doc_req.should_collect_selfie() && !id_doc.should_skip_selfie();
        let ctx = IncodeContext {
            di_id: di.id,
            sv_id: doc_req.scoped_vault_id,
            id_doc_id: id_doc.id,
            wf_id: doc_req.workflow_id,
            obc: obc.clone(),
            vault: uvw.vault,
            docv_data,
            vault_country,
            doc_request_id: doc_req.id,
            state: state.clone(),
            tenant_id: obc.tenant_id.clone(),
            ff_client: state.ff_client.clone(),
            failed_attempts_for_side: 0, /* !! this is the one thing that is hard coded here that would
                                          * differ from the existing code path that inits a IVS. We could
                                          * have this method pass in DocumentSide and calculate this for
                                          * real and then also call this init method from /upload and
                                          * consolidate code paths */
            disable_selfie,
            is_re_run: true,
            aws_selfie_client: state.aws_selfie_doc_client.clone(),
        };
        let is_sandbox = id_doc.fixture_result.is_some();
        Self::init(
            state,
            obc.tenant_id.clone(),
            get_config_id(state, should_collect_selfie, is_sandbox, &obc.tenant_id, None),
            ctx,
            is_sandbox,
        )
        .await
    }
}
