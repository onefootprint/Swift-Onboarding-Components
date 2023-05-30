use super::{
    states::{
        AddBack, AddConsent, AddFront, AddSelfie, Complete, FetchOCR, FetchScores, ProcessId,
        VerificationSession,
    },
    IncodeContext,
};
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{
    models::{
        document_upload::DocumentUpload,
        incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession},
        user_timeline::UserTimeline,
    },
    DbPool, TxnPgConn,
};
use enum_dispatch::enum_dispatch;
use idv::footprint_http_client::FootprintVendorHttpClient;
use newtypes::{DocumentSide, IdentityDocumentUploadedInfo, IncodeFailureReason};
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
        reason: IncodeFailureReason,
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
        http_client: &FootprintVendorHttpClient,
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

pub type IsReady = bool;

#[async_trait]
#[enum_dispatch]
pub trait RunTransition {
    async fn step(
        self,
        db_pool: &DbPool,
        http_client: &FootprintVendorHttpClient,
        ctx: IncodeContext,
        session: VerificationSession,
    ) -> ApiResult<(IncodeState, IncodeContext, VerificationSession, IsReady)>;
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
        http_client: &FootprintVendorHttpClient,
        ctx: IncodeContext,
        session: VerificationSession,
    ) -> ApiResult<(IncodeState, IncodeContext, VerificationSession, IsReady)> {
        let starting_state: IncodeState = self.into();
        let init_state = T::run(db_pool, http_client, &ctx, &session).await?;
        let Some(init_state) = init_state else {
            // First, check if the state is ready to run. It's possible we're in a state like
            // AddBack but haven't yet collected the back image
            return Ok((starting_state, ctx, session, false));
        };

        let result = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let (next_state, failure_reason) = match init_state.transition(conn, &ctx, &session)? {
                    StateResult::Ok(next_state) => {
                        // Atomically update the state of the session in the DB
                        (next_state, None)
                    }
                    StateResult::Retry {
                        next_state,
                        reason,
                        clear_sides,
                    } => {
                        // TODO implement retry limit
                        // TODO Change the appearance of this timeline event. Do we want to show _every_ fail?
                        let info = IdentityDocumentUploadedInfo {
                            id: ctx.id_doc_id.clone(),
                        };
                        UserTimeline::create(conn, info, ctx.vault.id.clone(), ctx.sv_id.clone())?;

                        // Deactivate the failed sides to require re-uploading. Otherwise, the user
                        // could re-initiate the incode machine without uploading a new doc
                        DocumentUpload::deactivate(conn, &ctx.id_doc_id, clear_sides)?;
                        (next_state, Some(reason))
                    }
                };
                let is_ready = failure_reason.is_none();
                let update = UpdateIncodeVerificationSession::set_state(next_state.name(), failure_reason);
                IncodeVerificationSession::update(conn, &session.id, update)?;
                // TODO return an Err here with the reason
                Ok((next_state, ctx, session, is_ready))
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
    FetchScores(Uninitialized<FetchScores>),
    FetchOCR(Uninitialized<FetchOCR>),
    Complete(Uninitialized<Complete>),
}
