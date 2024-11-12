use super::ob_configuration::IsLive;
use crate::DbResult;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::playbook;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::ApiKeyStatus;
use newtypes::Locked;
use newtypes::ObConfigurationKey;
use newtypes::PlaybookId;
use newtypes::TenantId;

/// A Playbook row groups together all versions of an ObConfiguration across edits.
#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = playbook)]
pub struct Playbook {
    pub id: PlaybookId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub key: ObConfigurationKey,
    pub tenant_id: TenantId,
    pub is_live: IsLive,
    /// Currently unused.
    /// TODO: implement playbook-wide immediate deactivation.
    pub status: ApiKeyStatus,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = playbook)]
pub struct NewPlaybook {
    pub key: ObConfigurationKey,
    pub tenant_id: TenantId,
    pub is_live: IsLive,
    pub status: ApiKeyStatus,
}

impl Playbook {
    #[tracing::instrument("Playbook::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, tenant_id: &TenantId, is_live: IsLive) -> DbResult<Locked<Self>> {
        let new_playbook = NewPlaybook {
            key: ObConfigurationKey::generate(is_live),
            tenant_id: tenant_id.clone(),
            is_live,
            status: ApiKeyStatus::Enabled,
        };

        let result = diesel::insert_into(playbook::table)
            .values(&new_playbook)
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("Playbook::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, playbook_id: &PlaybookId) -> DbResult<Locked<Self>> {
        let result = playbook::table
            .filter(playbook::id.eq(playbook_id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }
}
