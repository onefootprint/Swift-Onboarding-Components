use super::apple_device_attest::AppleDeviceAttestation;
use super::google_device_attest::GoogleDeviceAttestation;
use super::insight_event::InsightEvent;
use super::user_timeline::UserTimeline;
use crate::errors::ValidationError;
use crate::DbError;
use crate::DbResult;
use crate::NextPage;
use crate::OffsetPagination;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Duration;
use chrono::Utc;
use db_schema::schema;
use db_schema::schema::auth_event;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::ActionKind;
use newtypes::AuthEventId;
use newtypes::AuthEventKind;
use newtypes::AuthMethodKind;
use newtypes::AuthMethodUpdatedInfo;
use newtypes::IdentifyScope;
use newtypes::InsightEventId;
use newtypes::PasskeyId;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = auth_event)]
pub struct AuthEvent {
    pub id: AuthEventId,
    pub vault_id: VaultId,
    pub scoped_vault_id: Option<ScopedVaultId>,
    pub insight_event_id: Option<InsightEventId>,
    pub kind: AuthEventKind,
    pub webauthn_credential_id: Option<PasskeyId>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub scope: IdentifyScope,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = auth_event)]
pub struct NewAuthEventRow {
    pub vault_id: VaultId,
    pub scoped_vault_id: Option<ScopedVaultId>,
    pub insight_event_id: Option<InsightEventId>,
    pub kind: AuthEventKind,
    pub webauthn_credential_id: Option<PasskeyId>,
    pub created_at: DateTime<Utc>,
    pub scope: IdentifyScope,
}

#[derive(Debug)]
pub struct NewAuthEventArgs {
    pub vault_id: VaultId,
    pub scoped_vault_id: Option<ScopedVaultId>,
    pub insight_event_id: Option<InsightEventId>,
    pub kind: AuthEventKind,
    pub webauthn_credential_id: Option<PasskeyId>,
    pub created_at: DateTime<Utc>,
    pub scope: IdentifyScope,

    /// If this AuthEvent represents the first registration of an auth method,
    /// context on this new auth method.
    pub new_auth_method_action: Option<ActionKind>,
}

impl AuthEvent {
    #[tracing::instrument("AuthEvent::save", skip_all)]
    pub fn save(args: NewAuthEventArgs, conn: &mut TxnPgConn) -> DbResult<AuthEvent> {
        let NewAuthEventArgs {
            vault_id,
            scoped_vault_id,
            insight_event_id,
            kind,
            webauthn_credential_id,
            created_at,
            scope,
            new_auth_method_action,
        } = args;

        match scope {
            IdentifyScope::My1fp => (),
            IdentifyScope::Onboarding | IdentifyScope::Auth => {
                // We depend upon this in the validate API
                if scoped_vault_id.is_none() {
                    return Err(DbError::ValidationError(format!(
                        "Auth event of type {} must have a scoped_vault_id",
                        scope
                    )));
                }
            }
        }
        let row = NewAuthEventRow {
            vault_id: vault_id.clone(),
            scoped_vault_id: scoped_vault_id.clone(),
            insight_event_id,
            kind,
            webauthn_credential_id,
            created_at,
            scope,
        };
        let ev = diesel::insert_into(auth_event::table)
            .values(row)
            .get_result::<AuthEvent>(conn.conn())?;

        // For auth events when a new auth method is registered, create a timeline event
        if let Some(new_auth_method_action) = new_auth_method_action {
            if let Some(sv_id) = ev.scoped_vault_id.clone() {
                let kind = AuthMethodKind::try_from(ev.kind).map_err(|_| {
                    ValidationError("Can't create a timeline event for third-party auth event")
                })?;
                // Create a timeline event that shows the passkey was added
                let info = AuthMethodUpdatedInfo {
                    kind,
                    action: new_auth_method_action,
                    auth_event_id: ev.id.clone(),
                };
                UserTimeline::create(conn, info, ev.vault_id.clone(), sv_id)?;
            }
        }
        Ok(ev)
    }
}

pub struct LoadedAuthEvent {
    pub event: AuthEvent,
    pub insight: Option<InsightEvent>,
    pub attested_devices: Option<LinkedDeviceAttestation>,
}

pub struct LinkedDeviceAttestation {
    pub ios_devices: Vec<AppleDeviceAttestation>,
    pub android_devices: Vec<GoogleDeviceAttestation>,
}

impl AuthEvent {
    const AUTH_EVENT_EXPIRY_H: i64 = 1;

    #[tracing::instrument("AuthEvent::list_recent", skip_all)]
    /// Return auth events at this tenant in the last Self::AUTH_EVENT_EXPIRY_H hours.
    /// These auth events are proof that the end user has authenticated with footprint recently.
    /// If these auth events exist, the tenant is allowed to create an authed token for the user
    pub fn list_recent(conn: &mut PgConn, sv_id: &ScopedVaultId) -> DbResult<Vec<Self>> {
        let min_timestamp = Utc::now() - Duration::hours(Self::AUTH_EVENT_EXPIRY_H);
        let results = auth_event::table
            .filter(auth_event::scoped_vault_id.eq(sv_id))
            .filter(auth_event::created_at.gt(min_timestamp))
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument("AuthEvent::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &AuthEventId) -> DbResult<Self> {
        let result = auth_event::table.filter(auth_event::id.eq(id)).get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("AuthEvent::get_bulk", skip_all)]
    pub fn get_bulk(conn: &mut PgConn, ids: &[AuthEventId]) -> DbResult<Vec<Self>> {
        let results = auth_event::table
            .filter(auth_event::id.eq_any(ids))
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument("AuthEvent::get_bulk_for_timeline", skip_all)]
    pub fn get_bulk_for_timeline(
        conn: &mut PgConn,
        ids: Vec<AuthEventId>,
    ) -> DbResult<HashMap<AuthEventId, (Self, InsightEvent)>> {
        use db_schema::schema::insight_event;
        let results = auth_event::table
            // Not all have an insight event, but all the ones we care about do
            .inner_join(insight_event::table)
            .filter(auth_event::id.eq_any(ids))
            .get_results::<(Self, InsightEvent)>(conn)?
            .into_iter()
            .map(|e| (e.0.id.clone(), e))
            .collect();
        Ok(results)
    }

    #[tracing::instrument("AuthEvent::count", skip_all)]
    pub fn count(conn: &mut PgConn, sv_id: &ScopedVaultId) -> DbResult<i64> {
        let count = auth_event::table
            .filter(auth_event::scoped_vault_id.eq(sv_id))
            .count()
            .get_result(conn)?;
        Ok(count)
    }

    #[tracing::instrument("AuthEvent::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
        pagination: Option<OffsetPagination>,
    ) -> DbResult<(Vec<LoadedAuthEvent>, NextPage)> {
        let mut query = auth_event::table
            .left_join(schema::insight_event::table)
            .filter(auth_event::scoped_vault_id.eq(sv_id))
            .order(auth_event::created_at.desc())
            .into_boxed();
        if let Some(pagination) = pagination.as_ref() {
            query = query.limit(pagination.limit());
            if let Some(offset) = pagination.offset() {
                query = query.offset(offset);
            }
        }
        let results: Vec<(AuthEvent, Option<InsightEvent>)> = query.load(conn)?;

        // This is a bit hacky, but we may have >1 attestation per passkey cred
        // so we collect them together.
        let ios_attestations = AppleDeviceAttestation::list(conn, sv_id)?;
        let android_attestations = GoogleDeviceAttestation::list(conn, sv_id)?;

        let results = results
            .into_iter()
            .flat_map(|(event, insight)| {
                match (event.kind, &event.webauthn_credential_id) {
                    (AuthEventKind::Sms | AuthEventKind::Email | AuthEventKind::ThirdParty, None) => {
                        Some(LoadedAuthEvent {
                            insight,
                            attested_devices: None,
                            event,
                        })
                    },
                    (AuthEventKind::Passkey, Some(cred_id)) => {
                        let android_devices = android_attestations
                            .iter()
                            .filter(|att| att.webauthn_credential_id.as_ref() == Some(cred_id))
                            .cloned()
                            .collect();
                        let ios_devices = ios_attestations
                            .iter()
                            .filter(|att| att.webauthn_credential_id.as_ref() == Some(cred_id))
                            .cloned()
                            .collect();
                        Some(LoadedAuthEvent {
                            insight,
                            attested_devices: Some(LinkedDeviceAttestation {
                                android_devices,
                                ios_devices,
                            }),
                            event,
                        })
                    },
                    _ => {
                        tracing::error!(event_id=%event.id, "found unexpected combination of Kind and Passkey on AuthEvent");
                        None
                    },
                }
            })
            .collect();

        // This is very atypical to optionally support pagination
        if let Some(pagination) = pagination {
            Ok(pagination.results(results))
        } else {
            Ok((results, None))
        }
    }
}
