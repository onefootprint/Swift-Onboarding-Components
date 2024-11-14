use super::incode_verification_session_event::IncodeVerificationSessionEvent;
use crate::NonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Duration;
use chrono::Utc;
use db_schema::schema::document_request;
use db_schema::schema::identity_document;
use db_schema::schema::incode_verification_session::BoxedQuery;
use db_schema::schema::incode_verification_session::{
    self,
};
use diesel::pg::Pg;
use diesel::prelude::*;
use newtypes::DocumentId;
use newtypes::DocumentSide;
use newtypes::IncodeAuthorizationToken;
use newtypes::IncodeConfigurationId;
use newtypes::IncodeEnvironment;
use newtypes::IncodeFailureReason;
use newtypes::IncodeSessionId;
use newtypes::IncodeVerificationSessionId;
use newtypes::IncodeVerificationSessionKind;
use newtypes::IncodeVerificationSessionPurpose;
use newtypes::IncodeVerificationSessionState;
use newtypes::Locked;
use newtypes::WorkflowId;

#[derive(Debug, Clone, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = incode_verification_session)]
pub struct IncodeVerificationSession {
    pub id: IncodeVerificationSessionId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,

    pub incode_session_id: Option<IncodeSessionId>,
    pub incode_configuration_id: IncodeConfigurationId,
    pub incode_authentication_token: Option<IncodeAuthorizationToken>,
    pub incode_authentication_token_expires_at: Option<DateTime<Utc>>,

    /// There is one IncodeVerificationSession for each Document
    pub identity_document_id: DocumentId,
    pub state: IncodeVerificationSessionState,
    pub completed_at: Option<DateTime<Utc>>,
    pub kind: IncodeVerificationSessionKind,
    /// Not used by application code anywhere, just used for debugging
    #[diesel(deserialize_as = NonNullVec<IncodeFailureReason>)]
    pub latest_failure_reasons: Vec<IncodeFailureReason>,
    #[diesel(deserialize_as = NonNullVec<IncodeFailureReason>)]
    pub ignored_failure_reasons: Vec<IncodeFailureReason>,
    // When set, this IVS was replaced with a re-run via the manual private endpoint
    pub deactivated_at: Option<DateTime<Utc>>,
    pub incode_environment: Option<IncodeEnvironment>,
    pub latest_hard_error: Option<String>,
    // The purpose of this session as a whole (identity verification, curp validation, government validation.
    // )
    pub purpose: IncodeVerificationSessionPurpose,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = incode_verification_session)]
struct NewIncodeVerificationSession {
    created_at: DateTime<Utc>,
    state: IncodeVerificationSessionState,
    incode_configuration_id: IncodeConfigurationId,
    identity_document_id: DocumentId,
    kind: IncodeVerificationSessionKind,
    latest_failure_reasons: Vec<IncodeFailureReason>,
    ignored_failure_reasons: Vec<IncodeFailureReason>,
    incode_environment: Option<IncodeEnvironment>,
    purpose: IncodeVerificationSessionPurpose,
    incode_session_id: Option<IncodeSessionId>,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = incode_verification_session)]
pub struct UpdateIncodeVerificationSession {
    pub incode_session_id: Option<IncodeSessionId>,
    pub incode_authentication_token: Option<IncodeAuthorizationToken>,
    pub incode_authentication_token_expires_at: Option<DateTime<Utc>>,
    pub identity_document_id: Option<DocumentId>,
    pub completed_at: Option<DateTime<Utc>>,
    pub state: Option<IncodeVerificationSessionState>,
    pub latest_failure_reasons: Option<Vec<IncodeFailureReason>>,
    pub ignored_failure_reasons: Option<Vec<IncodeFailureReason>>,
    pub latest_hard_error: Option<String>,
}

impl UpdateIncodeVerificationSession {
    pub fn set_hard_error(latest_hard_error: String) -> Self {
        Self {
            latest_hard_error: Some(latest_hard_error),
            ..Self::default()
        }
    }

    pub fn set_state(
        state: IncodeVerificationSessionState,
        failure_reasons: Vec<IncodeFailureReason>,
        ignored_failure_reasons: Option<Vec<IncodeFailureReason>>,
    ) -> Self {
        Self {
            state: Some(state),
            completed_at: (state == IncodeVerificationSessionState::Complete).then_some(Utc::now()),
            // NOTE: this is tricky to read - this could be `Some(None)`, which would wipe the
            // failure reason. Need to wrap in outer option since by default, a diesel changeset
            // ignores any updates with value None
            latest_failure_reasons: Some(failure_reasons),
            ignored_failure_reasons,
            ..Self::default()
        }
    }

    pub fn set_state_and_incode_session_and_token(
        state: IncodeVerificationSessionState,
        session_id: IncodeSessionId,
        token: IncodeAuthorizationToken,
    ) -> Self {
        Self {
            incode_session_id: Some(session_id),
            incode_authentication_token: Some(token),
            // 90d is what incode communicated to us
            incode_authentication_token_expires_at: Some(Utc::now() + Duration::days(90)),
            state: Some(state),
            completed_at: (state == IncodeVerificationSessionState::Complete).then_some(Utc::now()),
            ..Self::default()
        }
    }
}

impl IncodeVerificationSession {
    #[tracing::instrument("IncodeVerificationSession::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        identity_document_id: DocumentId,
        configuration_id: IncodeConfigurationId,
        kind: IncodeVerificationSessionKind,
        incode_environment: Option<IncodeEnvironment>,
        incode_session_id: Option<IncodeSessionId>,
    ) -> FpResult<Self> {
        let purpose: IncodeVerificationSessionPurpose = kind.into();
        let new_req = NewIncodeVerificationSession {
            created_at: Utc::now(),
            state: starting_state_for_purpose(&purpose),
            incode_configuration_id: configuration_id,
            identity_document_id,
            kind,
            latest_failure_reasons: vec![],
            ignored_failure_reasons: vec![],
            incode_environment,
            purpose,
            incode_session_id,
        };

        let res: IncodeVerificationSession = diesel::insert_into(incode_verification_session::table)
            .values(new_req)
            .get_result(conn.conn())?;

        IncodeVerificationSessionEvent::create(
            conn,
            res.id.clone(),
            res.state,
            res.identity_document_id.clone(),
            vec![],
            kind,
            vec![],
        )?;

        Ok(res)
    }

    #[tracing::instrument("IncodeVerificationSession::deactivate", skip_all)]
    pub fn deactivate(conn: &mut TxnPgConn, id: &IncodeVerificationSessionId) -> FpResult<()> {
        diesel::update(incode_verification_session::table)
            .filter(incode_verification_session::id.eq(id))
            .set(incode_verification_session::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;

        Ok(())
    }

    #[tracing::instrument("IncodeVerificationSession::update", skip_all)]
    pub fn update(
        session: Locked<Self>,
        conn: &mut TxnPgConn,
        update: UpdateIncodeVerificationSession,
    ) -> FpResult<Self> {
        let res: IncodeVerificationSession = diesel::update(incode_verification_session::table)
            .filter(incode_verification_session::id.eq(&session.id))
            .set(update)
            .get_result(conn.conn())?;

        IncodeVerificationSessionEvent::create(
            conn,
            res.id.clone(),
            res.state,
            res.identity_document_id.clone(),
            res.latest_failure_reasons.clone(),
            res.kind,
            res.ignored_failure_reasons.clone(),
        )?;

        Ok(res)
    }

    fn query(id: IncodeSessionIdentifier) -> BoxedQuery<Pg> {
        let query = match id {
            IncodeSessionIdentifier::Id(id) => incode_verification_session::table
                .filter(incode_verification_session::id.eq(id))
                .into_boxed(),
            IncodeSessionIdentifier::IdDoc(id) => incode_verification_session::table
                .filter(incode_verification_session::identity_document_id.eq(id))
                .into_boxed(),
        };
        query.filter(incode_verification_session::deactivated_at.is_null())
    }

    #[tracing::instrument("IncodeVerificationSession::get", skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> FpResult<Option<Self>>
    where
        T: Into<IncodeSessionIdentifier<'a>>,
    {
        let vs = Self::query(id.into()).first(conn).optional()?;
        Ok(vs)
    }

    #[tracing::instrument("IncodeVerificationSession::latest_for_workflow", skip_all)]
    pub fn latest_for_workflow(conn: &mut PgConn, wf_id: &WorkflowId) -> FpResult<Option<Self>> {
        let res = document_request::table
            .filter(document_request::workflow_id.eq(wf_id))
            .inner_join(identity_document::table)
            .inner_join(
                incode_verification_session::table
                    .on(incode_verification_session::identity_document_id.eq(identity_document::id)),
            )
            .filter(incode_verification_session::deactivated_at.is_null())
            .order_by(incode_verification_session::created_at.desc())
            .select(incode_verification_session::all_columns)
            .first(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument("IncodeVerificationSession::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &IncodeVerificationSessionId) -> FpResult<Locked<Self>> {
        let result = incode_verification_session::table
            .filter(incode_verification_session::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }
}

#[derive(derive_more::From)]
pub enum IncodeSessionIdentifier<'a> {
    Id(&'a IncodeVerificationSessionId),
    IdDoc(&'a DocumentId),
}

impl IncodeVerificationSession {
    pub fn side_from_session(&self) -> Option<DocumentSide> {
        match self.state {
            IncodeVerificationSessionState::AddFront => Some(DocumentSide::Front),
            IncodeVerificationSessionState::AddBack => Some(DocumentSide::Back),
            IncodeVerificationSessionState::AddSelfie => Some(DocumentSide::Selfie),
            _ => None,
        }
    }
}

fn starting_state_for_purpose(purpose: &IncodeVerificationSessionPurpose) -> IncodeVerificationSessionState {
    match purpose {
        IncodeVerificationSessionPurpose::Identity => IncodeVerificationSessionState::StartOnboarding,
        // we don't have a full state machine for curp or gov't, IVS just used for record keeping
        IncodeVerificationSessionPurpose::CurpValidation => IncodeVerificationSessionState::Complete,
        IncodeVerificationSessionPurpose::GovernmentValidation => IncodeVerificationSessionState::Complete,
    }
}
