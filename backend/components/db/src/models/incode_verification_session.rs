use chrono::{DateTime, Duration, Utc};
use diesel::{pg::Pg, prelude::*};
use newtypes::{
    IdentityDocumentId, IncodeAuthorizationToken, IncodeConfigurationId, IncodeSessionId,
    IncodeVerificationFailureReason, IncodeVerificationSessionId, IncodeVerificationSessionKind,
    IncodeVerificationSessionState, ScopedVaultId,
};
use serde::{Deserialize, Serialize};

use crate::{
    schema::incode_verification_session::{self, BoxedQuery},
    DbResult, PgConn, TxnPgConn,
};

use super::incode_verification_session_event::IncodeVerificationSessionEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = incode_verification_session)]
pub struct IncodeVerificationSession {
    pub id: IncodeVerificationSessionId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,

    pub incode_session_id: Option<IncodeSessionId>,
    pub incode_configuration_id: IncodeConfigurationId,
    pub incode_authentication_token: Option<IncodeAuthorizationToken>,
    pub incode_authentication_token_expires_at: Option<DateTime<Utc>>,

    pub identity_document_id: IdentityDocumentId,
    pub state: IncodeVerificationSessionState,
    pub completed_at: Option<DateTime<Utc>>,
    pub latest_failure_reason: Option<IncodeVerificationFailureReason>,
    pub kind: IncodeVerificationSessionKind,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = incode_verification_session)]
pub struct NewIncodeVerificationSession {
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub state: IncodeVerificationSessionState,
    pub incode_configuration_id: IncodeConfigurationId,
    pub identity_document_id: IdentityDocumentId,
    pub kind: IncodeVerificationSessionKind,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = incode_verification_session)]
pub struct UpdateIncodeVerificationSession {
    pub incode_session_id: Option<IncodeSessionId>,
    pub incode_authentication_token: Option<IncodeAuthorizationToken>,
    pub incode_authentication_token_expires_at: Option<DateTime<Utc>>,
    pub identity_document_id: Option<IdentityDocumentId>,
    pub completed_at: Option<DateTime<Utc>>,
    pub state: Option<IncodeVerificationSessionState>,
    pub latest_failure_reason: Option<IncodeVerificationFailureReason>,
}

impl UpdateIncodeVerificationSession {
    pub fn set_state(state: IncodeVerificationSessionState) -> Self {
        Self {
            state: Some(state),
            completed_at: (state == IncodeVerificationSessionState::Complete).then_some(Utc::now()),
            latest_failure_reason: None,
            ..Self::default()
        }
    }
    pub fn set_state_to_retry_with_failure_reason(failure_reason: IncodeVerificationFailureReason) -> Self {
        Self {
            latest_failure_reason: Some(failure_reason),
            state: Some(IncodeVerificationSessionState::RetryUpload),
            ..Self::default()
        }
    }

    pub fn set_state_and_identity_document(
        state: IncodeVerificationSessionState,
        identity_document_id: IdentityDocumentId,
    ) -> Self {
        Self {
            state: Some(state),
            completed_at: (state == IncodeVerificationSessionState::Complete).then_some(Utc::now()),
            identity_document_id: Some(identity_document_id),
            latest_failure_reason: None,
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
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        scoped_vault_id: ScopedVaultId,
        configuration_id: IncodeConfigurationId,
        identity_document_id: IdentityDocumentId,
        kind: IncodeVerificationSessionKind,
    ) -> DbResult<Self> {
        let new_req = NewIncodeVerificationSession {
            created_at: Utc::now(),
            scoped_vault_id,
            state: IncodeVerificationSessionState::StartOnboarding,
            incode_configuration_id: configuration_id,
            identity_document_id,
            kind: kind.clone(),
        };

        let res: IncodeVerificationSession = diesel::insert_into(incode_verification_session::table)
            .values(new_req)
            .get_result(conn.conn())?;

        IncodeVerificationSessionEvent::create(
            conn,
            res.id.clone(),
            res.state,
            res.identity_document_id.clone(),
            None,
            kind,
        )?;

        Ok(res)
    }

    #[tracing::instrument(skip(conn))]
    pub fn get_or_create(
        conn: &mut TxnPgConn,
        scoped_vault_id: ScopedVaultId,
        configuration_id: IncodeConfigurationId,
        identity_document_id: IdentityDocumentId,
        kind: IncodeVerificationSessionKind,
    ) -> DbResult<Self> {
        let existing_session = Self::get(conn, &scoped_vault_id)?;

        if let Some(existing) = existing_session {
            Ok(existing)
        } else {
            let new = Self::create(
                conn,
                scoped_vault_id,
                configuration_id,
                identity_document_id,
                kind.clone(),
            )?;

            IncodeVerificationSessionEvent::create(
                conn,
                new.id.clone(),
                new.state,
                new.identity_document_id.clone(),
                None,
                kind,
            )?;

            Ok(new)
        }
    }

    #[tracing::instrument(skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
        id: &IncodeVerificationSessionId,
        update: UpdateIncodeVerificationSession,
    ) -> DbResult<Self> {
        let res: IncodeVerificationSession = diesel::update(incode_verification_session::table)
            .filter(incode_verification_session::id.eq(id))
            .set(update)
            .get_result(conn.conn())?;

        IncodeVerificationSessionEvent::create(
            conn,
            res.id.clone(),
            res.state,
            res.identity_document_id.clone(),
            res.latest_failure_reason.clone(),
            res.kind.clone(),
        )?;

        Ok(res)
    }

    fn query(id: IncodeSessionIdentifier) -> BoxedQuery<Pg> {
        match id {
            IncodeSessionIdentifier::Id(id) => incode_verification_session::table
                .filter(incode_verification_session::id.eq(id))
                .into_boxed(),
            IncodeSessionIdentifier::ScopedVaultId(scoped_vault_id) => incode_verification_session::table
                .filter(incode_verification_session::scoped_vault_id.eq(scoped_vault_id))
                .into_boxed(),
        }
    }

    #[tracing::instrument(skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> DbResult<Option<Self>>
    where
        T: Into<IncodeSessionIdentifier<'a>>,
    {
        // TODO: need to grab something like non-complete
        let vs = Self::query(id.into()).first(conn).optional()?;
        Ok(vs)
    }
}

pub enum IncodeSessionIdentifier<'a> {
    Id(&'a IncodeVerificationSessionId),
    ScopedVaultId(&'a ScopedVaultId),
}

impl<'a> From<&'a IncodeVerificationSessionId> for IncodeSessionIdentifier<'a> {
    fn from(id: &'a IncodeVerificationSessionId) -> Self {
        Self::Id(id)
    }
}

impl<'a> From<&'a ScopedVaultId> for IncodeSessionIdentifier<'a> {
    fn from(id: &'a ScopedVaultId) -> Self {
        Self::ScopedVaultId(id)
    }
}
