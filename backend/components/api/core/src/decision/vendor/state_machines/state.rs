use super::{
    incode_state_machine::IncodeContext,
    states::{
        AddBack, AddConsent, AddFront, Complete, FetchOCR, FetchScores, ProcessId, VerificationSession,
    },
};
use crate::errors::ApiResult;
use async_trait::async_trait;
use db::{
    models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession},
    DbPool, TxnPgConn,
};
use enum_dispatch::enum_dispatch;
use idv::footprint_http_client::FootprintVendorHttpClient;
use newtypes::IncodeFailureReason;
use std::marker::PhantomData;

pub struct Uninitialized<T>(PhantomData<T>);

impl<T> Uninitialized<T> {
    fn new() -> Self {
        Self(PhantomData::<T>)
    }
}

// Get the benefits of one simple trait to implement for each state!
#[async_trait]
pub trait IncodeStateTransition: Sized {
    /// Initializes a state of this type, performing all async operations needed before the atomic
    /// bookkeeping and state transition.
    /// If None is returned, the state is not ready to run
    async fn init(
        db_pool: &DbPool,
        http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>>;

    /// Perform any bookkeeping that must be atomic with the state transition upon exiting a state.
    /// Can access any context created in `init`.
    /// If an optional IncodeFailureReason is returned, the machine will break out of running
    /// until the error is addressed
    fn transition(
        self,
        conn: &mut TxnPgConn,
        ctx: &IncodeContext,
        session: &VerificationSession,
        // TODO could probably represent this with a Result<IncodeState, IncodeFailureReason>, but
        // also have the outer ApiResult<>...
    ) -> ApiResult<(IncodeState, Option<IncodeFailureReason>)>;

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
        let uninit_state: IncodeState = self.into();
        let init_state = T::init(db_pool, http_client, &ctx, &session).await?;
        let Some(init_state) = init_state else {
            // First, check if the state is ready to run. It's possible we're in a state like
            // AddBack but haven't yet collected the back image
            return Ok((uninit_state, ctx, session, false));
        };

        let result = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let (next_state, failure_reason) = init_state.transition(conn, &ctx, &session)?;
                let is_ready = failure_reason.is_none();
                // Atomically update the state of the session in the DB
                let update = UpdateIncodeVerificationSession::set_state(next_state.name(), failure_reason);
                IncodeVerificationSession::update(conn, &session.id, update)?;
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
    AddConsent(Uninitialized<AddConsent>),
    AddFront(Uninitialized<AddFront>),
    AddBack(Uninitialized<AddBack>),
    ProcessId(Uninitialized<ProcessId>),
    FetchScores(Uninitialized<FetchScores>),
    FetchOCR(Uninitialized<FetchOCR>),
    Complete(Uninitialized<Complete>),
}
