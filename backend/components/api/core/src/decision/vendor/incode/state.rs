use super::{
    states::{
        AddBack, AddConsent, AddFront, AddSelfie, Complete, Fail, FetchScores, GetOnboardingStatus,
        ProcessFace, ProcessId, VerificationSession,
    },
    IncodeContext,
};
use crate::{errors::ApiResult, vendor_clients::IncodeClients};
use async_trait::async_trait;
use db::{
    models::{
        document_upload::DocumentUpload,
        incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession},
    },
    DbPool, TxnPgConn,
};
use enum_dispatch::enum_dispatch;
use itertools::Itertools;
use newtypes::{DocumentSide, IncodeFailureReason};
use std::marker::PhantomData;

pub struct Uninitialized<T>(PhantomData<T>);

impl<T> Uninitialized<T> {
    fn new() -> Self {
        Self(PhantomData::<T>)
    }
}

/// A special enum state that encompasses an in-between error state that we should recover and
/// display nicely to the client
pub enum StateResult {
    /// State completed successfully. Transition to the provided next state
    Ok(IncodeState),
    /// An incode failure occurred that can be retried by uploading a new image.
    /// Different from a normal Err result because these error codes are well-formatted and can be
    /// retried
    Retry {
        next_state: IncodeState,
        reasons: Vec<IncodeFailureReason>,
        /// The list of sides to wipe clear for this identity document in order to retry uploading
        clear_sides: Vec<DocumentSide>,
    },
}

impl From<IncodeState> for StateResult {
    fn from(value: IncodeState) -> Self {
        Self::Ok(value)
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
    ) -> ApiResult<Option<Self>>;

    /// Perform any bookkeeping that must be atomic with the state transition upon exiting a state.
    /// Can access any context created in `run`.
    /// If an optional IncodeFailureReason is returned, the machine will break out of running
    /// until the error is addressed
    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<StateResult>;

    #[allow(clippy::new_ret_no_self)]
    fn new() -> IncodeState
    where
        IncodeState: From<Uninitialized<Self>>,
    {
        Uninitialized::<Self>::new().into()
    }
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
    ) -> ApiResult<(IncodeState, StepResult, IncodeContext, VerificationSession)>;
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
    ) -> ApiResult<(IncodeState, StepResult, IncodeContext, VerificationSession)> {
        let starting_state = self.into();
        let init_state = T::run(db_pool, clients, &ctx, &session).await?;
        let Some(init_state) = init_state else {
            // First, check if the state is ready to run. It's possible we're in a state like
            // AddBack but haven't yet collected the back image
            return Ok((starting_state, StepResult::Break, ctx, session));
        };

        let result = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let next = init_state.transition(conn, &ctx, &session)?;
                let (next_state, retry_reasons, ignore_reasons) = match next {
                    StateResult::Ok(next_state) => {
                        // Atomically update the state of the session in the DB
                        (next_state, vec![], None)
                    }
                    StateResult::Retry {
                        mut next_state,
                        reasons,
                        clear_sides,
                    } => {
                        // Mark the sides as failed to require re-uploading. Otherwise, the user
                        // could re-initiate the incode machine without uploading a new doc
                        DocumentUpload::deactivate(conn, &ctx.id_doc_id, clear_sides, reasons.clone())?;

                        // Count if we have failed too many times
                        let exceeded_max_attempts =
                            ctx.failed_attempts_for_side + 1 >= DocumentUpload::MAX_ATTEMPTS_PER_SIDE;

                        let ignore_reasons = if exceeded_max_attempts {
                            if reasons.iter().all(|s| s.can_ignore()) {
                                // TODO some ignored errors will cause future incode reqs to fail. Need to
                                // handle those cases. For now, we can only allow ignoring certain
                                // errors
                                // Chain together existing ignored errors and new errors to ignore
                                let ignore_reasons = reasons
                                    .clone()
                                    .into_iter()
                                    .chain(session.ignored_failure_reasons.clone().into_iter())
                                    .unique()
                                    .collect();
                                Some(ignore_reasons)
                            } else {
                                // Override the next state to a failed state if we've reached the max
                                // attempts
                                Fail::enter(conn, &ctx)?;
                                next_state = Fail::new();
                                None
                            }
                        } else {
                            None
                        };
                        (next_state, reasons, ignore_reasons)
                    }
                };
                let update = UpdateIncodeVerificationSession::set_state(
                    next_state.name(),
                    retry_reasons.clone(),
                    ignore_reasons,
                );
                IncodeVerificationSession::update(conn, &session.id, update)?;
                let result = if retry_reasons.is_empty() {
                    StepResult::Ready
                } else {
                    StepResult::Retry(retry_reasons)
                };
                Ok((next_state, result, ctx, session))
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
