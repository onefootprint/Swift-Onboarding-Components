use db_schema::schema;

use newtypes::AuthEventId;
use newtypes::AuthEventKind;
use newtypes::IdentifyScope;
use newtypes::WebauthnCredentialId;
use crate::DbError;
use crate::DbResult;
use crate::NextPage;
use crate::OffsetPagination;
use db_schema::schema::auth_event;
use chrono::{DateTime, Utc};
use crate::PgConn;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};

use newtypes::InsightEventId;
use newtypes::ScopedVaultId;

use newtypes::VaultId;
use super::apple_device_attest::AppleDeviceAttestation;
use super::google_device_attest::GoogleDeviceAttestation;
use super::insight_event::InsightEvent;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = auth_event)]
pub struct AuthEvent {
    pub id: AuthEventId,
    pub vault_id: VaultId,
    pub scoped_vault_id: Option<ScopedVaultId>,
    pub insight_event_id: Option<InsightEventId>,
    pub kind: AuthEventKind,
    pub webauthn_credential_id: Option<WebauthnCredentialId>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub scope: IdentifyScope,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = auth_event)]
pub struct NewAuthEvent {
    pub vault_id: VaultId,
    pub scoped_vault_id: Option<ScopedVaultId>,
    pub insight_event_id: Option<InsightEventId>,
    pub kind: AuthEventKind,
    pub webauthn_credential_id: Option<WebauthnCredentialId>,
    pub created_at: DateTime<Utc>,
    pub scope: IdentifyScope,
}

impl NewAuthEvent {
    #[tracing::instrument("NewAuthEvent::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<AuthEvent> {
        match &self.scope {
            IdentifyScope::My1fp => (),
            IdentifyScope::Onboarding | IdentifyScope::Auth => {
                // We depend upon this in the validate API
                if self.scoped_vault_id.is_none() {
                    return Err(DbError::ValidationError(format!("Auth event of type {} must have a scoped_vault_id", self.scope)));
                }
            }
        }
        let ev = diesel::insert_into(auth_event::table)
            .values(self)
            .get_result(conn)?;
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
    pub android_devices: Vec<GoogleDeviceAttestation>
}

impl AuthEvent {
    #[tracing::instrument("AuthEvent::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &AuthEventId) -> DbResult<Self> {
        let result = auth_event::table
            .filter(auth_event::id.eq(id))
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("AuthEvent::get_bulk", skip_all)]
    pub fn get_bulk(conn: &mut PgConn, ids: &[AuthEventId]) -> DbResult<Vec<Self>> {
        let results = auth_event::table
            .filter(auth_event::id.eq_any(ids))
            .get_results(conn)?;
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
                    (AuthEventKind::Sms | AuthEventKind::Email, None) => {
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
                        tracing::error!(event_id=%event.id, "found unexpected combination of Kind and WebauthnCredential on AuthEvent");
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
