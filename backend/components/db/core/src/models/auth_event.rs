use db_schema::schema;
use db_schema::schema::scoped_vault;
use newtypes::AuthEventId;
use newtypes::AuthEventKind;
use newtypes::WebauthnCredentialId;

use crate::DbError;
use crate::DbResult;
use db_schema::schema::auth_event;

use chrono::{DateTime, Utc};

use crate::PgConn;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};

use newtypes::FpId;
use newtypes::InsightEventId;

use newtypes::ScopedVaultId;
use newtypes::TenantId;
use newtypes::VaultId;

use serde::{Deserialize, Serialize};

use super::apple_device_attest::AppleDeviceAttestation;
use super::insight_event::InsightEvent;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
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
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = auth_event)]
pub struct NewAuthEvent {
    pub vault_id: VaultId,
    pub scoped_vault_id: Option<ScopedVaultId>,
    pub insight_event_id: Option<InsightEventId>,
    pub kind: AuthEventKind,
    pub webauthn_credential_id: Option<WebauthnCredentialId>,
    pub created_at: DateTime<Utc>,
}

impl NewAuthEvent {
    #[tracing::instrument("NewAuthEvent::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> Result<AuthEvent, DbError> {
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
    pub unique_vaults_associated_by_attestation: i64,
    pub ios_devices: Vec<AppleDeviceAttestation>
    // TODO: Android
}

impl AuthEvent {
    #[tracing::instrument("AuthEvent::list_for_scoped_vault", skip_all)]
    pub fn list_for_scoped_vault(
        conn: &mut PgConn,
        fp_id: &FpId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> DbResult<Vec<LoadedAuthEvent>> {

        #[allow(clippy::type_complexity)]
        let results: Vec<(
            AuthEvent,
            Option<InsightEvent>,
        )> = auth_event::table
            .inner_join(scoped_vault::table)
            .left_join(schema::insight_event::table)
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::fp_id.eq(fp_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .order(auth_event::created_at.desc())
            .select((
                auth_event::all_columns,
                schema::insight_event::all_columns.nullable(),
            ))
            .load(conn)?;

        // This is a bit hacky, but we may have >1 attestation per passkey cred
        // so we collect them together.
        let (ios_attestations, unique_vault_associations) = AppleDeviceAttestation::list_for_scoped_user(conn, fp_id, tenant_id, is_live)?;

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
                    }
                    (AuthEventKind::Passkey, Some(cred_id))=> {                        

                        Some(LoadedAuthEvent {
                            insight,
                            attested_devices: Some(LinkedDeviceAttestation { 
                                unique_vaults_associated_by_attestation: unique_vault_associations, 
                                ios_devices: ios_attestations
                                    .iter()
                                    .filter(|att| att.webauthn_credential_id.as_ref() == Some(cred_id))
                                    .cloned()
                                    .collect() 
                            }),
                            event
                        })
                    },
                    _ => {
                        tracing::error!(event_id=%event.id, "found unexpected combination of Kind and WebauthnCredential on AuthEvent");
                        None
                    },

                }
            })
            .collect();
        Ok(results)
    }
}
