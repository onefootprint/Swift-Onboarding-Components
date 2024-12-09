use super::states::AddBack;
use super::states::AddConsent;
use super::states::AddFront;
use super::states::AddSelfie;
use super::states::Complete;
use super::states::Fail;
use super::states::FetchScores;
use super::states::GetOnboardingStatus;
use super::states::ProcessFace;
use super::states::ProcessId;
use super::states::VerificationSession;
use super::IncodeContext;
use crate::decision::state::StateError;
use crate::vendor_clients::IncodeClients;
use crate::FpResult;
use api_errors::ServerErr;
use async_trait::async_trait;
use db::models::document_upload::DocumentUpload;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::incode_verification_session::UpdateIncodeVerificationSession;
use db::models::verification_request::VerificationRequest;
use db::DbPool;
use db::TxnPgConn;
use enum_dispatch::enum_dispatch;
use itertools::Itertools;
use newtypes::DocumentSide;
use newtypes::IncodeFailureReason;
use newtypes::VendorAPI;
use newtypes::VerificationResultId;
use std::marker::PhantomData;

pub struct Uninitialized<T>(PhantomData<T>);

impl<T> Uninitialized<T> {
    fn new() -> Self {
        Self(PhantomData::<T>)
    }
}

pub struct TransitionResult {
    /// Any failure reasons experienced during the handling of this state
    pub failure_reasons: Vec<IncodeFailureReason>,
    /// The side being handled by this step of the Incode machine. It will be cleared if there is an
    /// error.
    pub side: Option<DocumentSide>,
}

impl From<IncodeState> for TransitionResult {
    /// Shorthand for the common case that has no possibility to fail
    fn from(_value: IncodeState) -> Self {
        Self {
            failure_reasons: vec![],
            side: None,
        }
    }
}

// Get the benefits of one simple trait to implement for each state!
#[async_trait]
pub trait IncodeStateTransition: Sized {
    /// Initializes a state of this type, performing all async operations needed before the atomic
    /// bookkeeping and state transition.
    /// If None is returned, the state is not ready to run
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> FpResult<Option<Self>>;

    /// Perform any bookkeeping that must be atomic with the state transition upon exiting a state.
    /// Can access any context created in `run`.
    /// If an optional IncodeFailureReason is returned, the machine will break out of running
    /// until the error is addressed
    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> FpResult<TransitionResult>;

    #[allow(clippy::new_ret_no_self)]
    fn new() -> IncodeState
    where
        IncodeState: From<Uninitialized<Self>>,
    {
        Uninitialized::<Self>::new().into()
    }

    fn next_state(session: &VerificationSession) -> IncodeState;
}

#[async_trait]
#[enum_dispatch]
pub trait RunTransition {
    async fn step(
        self,
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: IncodeContext,
        session: VerificationSession,
    ) -> FpResult<(IncodeState, StepResult, IncodeContext, VerificationSession)>;
}

pub enum StepResult {
    /// Proceed to run the next IncodeState
    Ready,
    /// Break out of running the machine - we aren't ready for the next state
    Break,
    /// Break out of running the machine and prompt the user to retry
    Retry(Vec<IncodeFailureReason>),
}

/// Convenience trait to make enum_dispatch easier - wraps the pretty `IncodeState` trait to
/// implement functionality to transition between states, specifically to work with trait dispatch.
/// Should only be automatically implemented for Uninitialized<T>
#[async_trait]
impl<T> RunTransition for Uninitialized<T>
where
    T: IncodeStateTransition + std::marker::Send + 'static,
    IncodeState: From<Self>,
{
    async fn step(
        self,
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: IncodeContext,
        session: VerificationSession,
    ) -> FpResult<(IncodeState, StepResult, IncodeContext, VerificationSession)> {
        let starting_state = self.into();
        // we know what we'll transition to, based properties of the session
        let default_next_state = T::next_state(&session);
        let init_state = T::run(db_pool, clients, &ctx, &session).await?;
        let Some(init_state) = init_state else {
            // First, check if the state is ready to run. It's possible we're in a state like
            // AddBack but haven't yet collected the back image
            return Ok((starting_state, StepResult::Break, ctx, session));
        };

        let result = db_pool
            .db_transaction(move |conn| {
                let ivs = IncodeVerificationSession::lock(conn, &session.id)?;
                if ivs.state != starting_state.name() {
                    Err(StateError::IncodeMachineConcurrentStateChange(
                        starting_state.name(),
                        ivs.state,
                    ))?
                }
                let result = init_state.transition(conn, &ctx, &session)?;
                let TransitionResult {
                    failure_reasons: all_failure_reasons,
                    side,
                } = result;

                // Calculate the reasons that are specifically not ignored
                let unhandled_failure_reasons = all_failure_reasons
                    .clone()
                    .into_iter()
                    .filter(|r| !session.ignored_failure_reasons.contains(r))
                    .filter(|r| !r.can_proceed_immediately_if_present()) // this is getting complicated...
                    .collect_vec();

                let (step_result, next_state, new_ignore_reasons) = if unhandled_failure_reasons.is_empty() {
                    // add immediately proceed reasons to session so we generate FRCs in `complete.rs`
                    let immediately_proceed_ignore_reasons: Vec<IncodeFailureReason> = all_failure_reasons
                        .iter()
                        .filter(|r| r.can_proceed_immediately_if_present())
                        .cloned()
                        .collect();
                    let ignore_reasons = if immediately_proceed_ignore_reasons.is_empty() {
                        None
                    } else {
                        Some(immediately_proceed_ignore_reasons)
                    };

                    (StepResult::Ready, default_next_state, ignore_reasons)
                } else {
                    // Some unhandled errors - decide how to proceed.
                    // We'll either retry the current state, or ignore the errors and move to the next state

                    // Count if we have failed too many times
                    let exceeded_max_attempts =
                        ctx.failed_attempts_for_side + 1 >= DocumentUpload::MAX_ATTEMPTS_PER_SIDE;
                    // Retry if we haven't exceeded max attempts AND this isn't a re-run flow.
                    // Re-run flows aren't interactive, so we should never retry, which breaks out of the
                    // machine
                    let should_retry = !exceeded_max_attempts && !ctx.is_re_run;

                    let (result, deactivate) = if should_retry {
                        // We haven't reached the max attempts - stay in the current state.
                        // But, only return the unhandled_failure_reasons to the client
                        (
                            (StepResult::Retry(unhandled_failure_reasons), T::new(), None),
                            true,
                        )
                    } else {
                        // We've reached the max attempts for this side
                        // TODO some ignored errors will cause future incode reqs to fail. Need to
                        // handle those cases. For now, we can only allow ignoring certain
                        // errors
                        let can_ignore_all_errors = unhandled_failure_reasons.iter().all(|s| s.can_ignore());
                        if !can_ignore_all_errors && !ctx.is_re_run {
                            let (vres_id, vendor_api): (VerificationResultId, VendorAPI) =
                                VerificationRequest::list(conn,  &ctx.di_id)?
                            .into_iter()
                            .filter(|(vreq, _)| vreq.vendor_api.is_incode_doc_flow_api())
                            .filter_map(|(vreq, vres)| vres.map(|v| (v.id, vreq.vendor_api)))
                            .collect::<Vec<_>>()
                            .first()
                            .cloned()
                            // TODO: if there's an issue with StartOnboarding and we fail, then this will error, fix in upstack
                            .ok_or(ServerErr(
                                "cannot find incode vres for doc upload failed FRC",
                            ))?;
                            // Fail if theres an unhandled error
                            Fail::enter(conn, &ctx.sv_id, &ctx.wf_id, &ctx.id_doc_id, vres_id, vendor_api)?;
                            ((StepResult::Ready, Fail::new(), None), true)
                        } else {
                            let new_ignore_reasons = unhandled_failure_reasons
                                .into_iter()
                                .chain(session.ignored_failure_reasons.clone().into_iter())
                                .unique()
                                .collect();
                            // All of the unhandled failures are ignorable.
                            // Advance to the next state and add new ignore_reasons
                            (
                                (StepResult::Ready, default_next_state, Some(new_ignore_reasons)),
                                false,
                            )
                        }
                    };
                    if let Some(side) = side {
                        // Add the failure reasons to the DocumentUpload.
                        // Optionally mark the upload as failed to require re-uploading
                        let reasons = all_failure_reasons.clone();
                        DocumentUpload::set_failure_reasons(conn, &ctx.id_doc_id, side, reasons, deactivate)?;
                    }
                    result
                };

                let update = UpdateIncodeVerificationSession::set_state(
                    next_state.name(),
                    all_failure_reasons,
                    new_ignore_reasons,
                );

                if matches!(next_state, IncodeState::AddConsent(_)) {
                    AddConsent::enter(conn, &ctx.id_doc_id)?;
                }

                let ivs = IncodeVerificationSession::update(ivs, conn, update)?;
                // refresh our VerificationSession object that we pass around from IncodeState to IncodeState
                let session = session.refresh(&ivs);

                Ok((next_state, step_result, ctx, session))
            })
            .await?;

        Ok(result)
    }
}

/// Represents all of the states that the incode machine can be in.
/// We use this `Uninitialized<T>` wrapper to represent each state since they won't be initialized
/// until they are run.
#[enum_dispatch(RunTransition)]
pub enum IncodeState {
    AddFront(Uninitialized<AddFront>),
    AddBack(Uninitialized<AddBack>),
    AddConsent(Uninitialized<AddConsent>),
    AddSelfie(Uninitialized<AddSelfie>),
    ProcessId(Uninitialized<ProcessId>),
    ProcessFace(Uninitialized<ProcessFace>),
    GetOnboardingStatus(Uninitialized<GetOnboardingStatus>),
    FetchScores(Uninitialized<FetchScores>),
    Complete(Uninitialized<Complete>),
    Fail(Uninitialized<Fail>),
}
